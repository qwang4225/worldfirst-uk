import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || 'user-1';

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const notification = await prisma.notification.create({
    data: {
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      link: body.link,
    },
  });

  return NextResponse.json(notification, { status: 201 });
}
