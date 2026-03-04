import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [project, milestones, unscheduled] = await Promise.all([
    prisma.project.findUnique({ where: { id }, select: { startDate: true, endDate: true } }),
    prisma.milestone.findMany({
      where: { projectId: id },
      include: {
        requirements: {
          include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.requirement.findMany({
      where: { projectId: id, milestoneId: null },
      include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
    }),
  ]);

  return NextResponse.json({
    milestones,
    unscheduled,
    projectStart: project?.startDate?.toISOString() || new Date().toISOString(),
    projectEnd: project?.endDate?.toISOString() || new Date(Date.now() + 180 * 86400000).toISOString(),
  });
}
