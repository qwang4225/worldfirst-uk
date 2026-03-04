import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');

  const where: Record<string, unknown> = { projectId: id };
  if (userId) where.userId = userId;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
  }

  const workLogs = await prisma.workLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      requirement: { select: { id: true, title: true } },
    },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(workLogs);
}
