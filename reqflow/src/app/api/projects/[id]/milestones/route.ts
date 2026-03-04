import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestones = await prisma.milestone.findMany({
    where: { projectId: id },
    include: {
      requirements: {
        select: { id: true, title: true, status: true, priority: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
  return NextResponse.json(milestones);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const milestone = await prisma.milestone.create({
    data: {
      projectId: id,
      title: body.title,
      titleZh: body.titleZh || '',
      dueDate: new Date(body.dueDate),
      description: body.description,
    },
  });

  return NextResponse.json(milestone, { status: 201 });
}
