import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const workLog = await prisma.workLog.create({
    data: {
      userId: body.userId,
      requirementId: body.requirementId || null,
      projectId: body.projectId,
      date: new Date(body.date),
      hours: body.hours,
      description: body.description,
    },
  });

  return NextResponse.json(workLog, { status: 201 });
}
