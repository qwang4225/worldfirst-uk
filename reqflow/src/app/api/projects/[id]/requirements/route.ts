import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const priority = url.searchParams.get('priority');
  const status = url.searchParams.get('status');
  const kanbanColumn = url.searchParams.get('kanbanColumn');
  const goal = url.searchParams.get('goal');
  const assigneeId = url.searchParams.get('assigneeId');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = { projectId: id };
  if (priority) where.priority = priority;
  if (status) where.status = status;
  if (kanbanColumn) where.kanbanColumn = kanbanColumn;
  if (goal) where.goal = goal;
  if (assigneeId) where.assignedToId = assigneeId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { titleZh: { contains: search } },
      { requester: { contains: search } },
    ];
  }

  const requirements = await prisma.requirement.findMany({
    where,
    include: {
      submittedBy: { select: { id: true, name: true, avatar: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true, attachments: true } },
    },
    orderBy: [{ kanbanColumn: 'asc' }, { sortOrder: 'asc' }],
  });

  return NextResponse.json(requirements);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const maxSort = await prisma.requirement.aggregate({
    where: { projectId: id, kanbanColumn: body.kanbanColumn || 'BACKLOG' },
    _max: { sortOrder: true },
  });

  const requirement = await prisma.requirement.create({
    data: {
      projectId: id,
      submittedById: body.submittedById || 'user-1',
      assignedToId: body.assignedToId,
      title: body.title,
      titleZh: body.titleZh || '',
      requester: body.requester || '',
      contactEmail: body.contactEmail || '',
      desiredLaunchDate: body.desiredLaunchDate ? new Date(body.desiredLaunchDate) : null,
      estimatedStartDate: body.estimatedStartDate ? new Date(body.estimatedStartDate) : null,
      isHardDeadline: body.isHardDeadline || false,
      hardDeadlineReason: body.hardDeadlineReason,
      goal: body.goal || 'OTHER',
      goalDetail: body.goalDetail,
      successMetric: body.successMetric,
      successMetricOwner: body.successMetricOwner,
      successDataProvider: body.successDataProvider,
      pageScope: body.pageScope,
      audience: body.audience ? JSON.stringify(body.audience) : null,
      targetRegions: body.targetRegions ? JSON.stringify(body.targetRegions) : null,
      customerType: body.customerType ? JSON.stringify(body.customerType) : null,
      contentAssets: body.contentAssets ? JSON.stringify(body.contentAssets) : null,
      designNeeded: body.designNeeded || false,
      figmaLink: body.figmaLink,
      trackingRequirements: body.trackingRequirements,
      seoReviewPoints: body.seoReviewPoints,
      acceptanceCriteria: body.acceptanceCriteria,
      dependencies: body.dependencies,
      priority: body.priority || 'P2',
      priorityReason: body.priorityReason,
      status: body.status || 'SUBMITTED',
      kanbanColumn: body.kanbanColumn || 'BACKLOG',
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      estimatedHours: body.estimatedHours,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      milestoneId: body.milestoneId,
    },
  });

  return NextResponse.json(requirement, { status: 201 });
}
