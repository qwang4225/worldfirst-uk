import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requirement = await prisma.requirement.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, nameZh: true, status: true } },
      submittedBy: { select: { id: true, name: true, avatar: true, email: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          replies: {
            include: { author: { select: { id: true, name: true, avatar: true } } },
          },
        },
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
      },
      attachments: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      milestone: true,
    },
  });

  if (!requirement) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(requirement);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const current = await prisma.requirement.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (body.status && body.status !== current.status) {
    await prisma.statusHistory.create({
      data: {
        requirementId: id,
        fromStatus: current.status,
        toStatus: body.status,
        changedById: body.changedById || null,
      },
    });
  }

  const updateData: Record<string, unknown> = {};
  const fields = [
    'title', 'titleZh', 'requester', 'contactEmail', 'isHardDeadline',
    'hardDeadlineReason', 'goal', 'goalDetail', 'successMetric', 'successMetricOwner',
    'successDataProvider', 'pageScope', 'designNeeded', 'figmaLink',
    'trackingRequirements', 'seoReviewPoints', 'acceptanceCriteria', 'dependencies',
    'priority', 'priorityReason', 'status', 'kanbanColumn', 'sortOrder',
    'estimatedHours', 'actualHours', 'milestoneId', 'assignedToId',
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (body.desiredLaunchDate !== undefined) {
    updateData.desiredLaunchDate = body.desiredLaunchDate ? new Date(body.desiredLaunchDate) : null;
  }
  if (body.estimatedStartDate !== undefined) {
    updateData.estimatedStartDate = body.estimatedStartDate ? new Date(body.estimatedStartDate) : null;
  }

  const jsonFields = ['audience', 'targetRegions', 'customerType', 'contentAssets', 'tags'];
  for (const field of jsonFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field] ? JSON.stringify(body[field]) : null;
    }
  }

  const requirement = await prisma.requirement.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(requirement);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const comment = await prisma.comment.create({
    data: {
      requirementId: id,
      authorId: body.authorId || 'user-1',
      content: body.content,
      contentZh: body.contentZh,
      isInternal: body.isInternal || false,
      parentId: body.parentId || null,
    },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
