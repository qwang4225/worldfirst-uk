import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const COLUMN_TO_STATUS: Record<string, string> = {
  BACKLOG: 'SUBMITTED',
  TODO: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { kanbanColumn, sortOrder } = body;

  const current = await prisma.requirement.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const newStatus = COLUMN_TO_STATUS[kanbanColumn] || current.status;

  if (newStatus !== current.status) {
    await prisma.statusHistory.create({
      data: {
        requirementId: id,
        fromStatus: current.status,
        toStatus: newStatus,
      },
    });
  }

  const requirement = await prisma.requirement.update({
    where: { id },
    data: {
      kanbanColumn,
      status: newStatus,
      sortOrder: sortOrder ?? current.sortOrder,
    },
  });

  return NextResponse.json(requirement);
}
