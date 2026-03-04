import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [requirements, milestones, recentHistory] = await Promise.all([
    prisma.requirement.findMany({
      where: { projectId: id },
      select: {
        id: true, title: true, status: true, kanbanColumn: true, priority: true,
        goal: true, desiredLaunchDate: true, estimatedHours: true, actualHours: true, updatedAt: true,
      },
    }),
    prisma.milestone.findMany({
      where: { projectId: id },
      include: { requirements: { select: { kanbanColumn: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.statusHistory.findMany({
      where: { requirement: { projectId: id } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { requirement: { select: { title: true } } },
    }),
  ]);

  const total = requirements.length;
  const byStatus: Record<string, number> = {};
  const byGoal: Record<string, number> = {};
  let doneCount = 0;
  let onTimeCount = 0;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  let thisWeekDone = 0;

  for (const req of requirements) {
    byStatus[req.kanbanColumn] = (byStatus[req.kanbanColumn] || 0) + 1;
    byGoal[req.goal] = (byGoal[req.goal] || 0) + 1;
    if (req.status === 'DONE') {
      doneCount++;
      if (req.desiredLaunchDate && req.updatedAt <= req.desiredLaunchDate) onTimeCount++;
      if (req.updatedAt >= weekAgo) thisWeekDone++;
    }
  }

  const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000);
  const doneInFourWeeks = requirements.filter((r) => r.status === 'DONE' && r.updatedAt >= fourWeeksAgo).length;
  const velocity = Math.round((doneInFourWeeks / 4) * 10) / 10;

  const milestonesData = milestones.map((ms) => ({
    id: ms.id, title: ms.title, dueDate: ms.dueDate.toISOString(),
    reqCount: ms.requirements.length,
    doneCount: ms.requirements.filter((r) => r.kanbanColumn === 'DONE').length,
  }));

  const activity = recentHistory.map((h) => ({
    id: h.id, type: 'status_change',
    description: `${h.requirement.title}: ${h.fromStatus} → ${h.toStatus}`,
    createdAt: h.createdAt.toISOString(), userName: 'System',
  }));

  return NextResponse.json({
    totalRequirements: total, byStatus, byGoal,
    onTimeRate: doneCount > 0 ? Math.round((onTimeCount / doneCount) * 100) : 100,
    thisWeekDone, velocity,
    milestones: milestonesData, activity,
    requirements: requirements.map((r) => ({
      id: r.id, title: r.title, priority: r.priority, goal: r.goal, estimatedHours: r.estimatedHours,
    })),
  });
}
