import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || 'user-1';

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
