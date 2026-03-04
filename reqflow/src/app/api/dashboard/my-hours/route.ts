import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || 'user-1';

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [weekHours, todayHours] = await Promise.all([
    prisma.workLog.aggregate({
      where: { userId, date: { gte: startOfWeek } },
      _sum: { hours: true },
    }),
    prisma.workLog.aggregate({
      where: { userId, date: { gte: startOfDay } },
      _sum: { hours: true },
    }),
  ]);

  return NextResponse.json({
    weekHours: weekHours._sum.hours || 0,
    todayHours: todayHours._sum.hours || 0,
  });
}
