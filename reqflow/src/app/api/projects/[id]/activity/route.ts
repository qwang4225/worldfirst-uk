import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [statusChanges, comments, recentReqs] = await Promise.all([
    prisma.statusHistory.findMany({
      where: { requirement: { projectId: id } },
      include: { requirement: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.comment.findMany({
      where: { requirement: { projectId: id } },
      include: {
        author: { select: { name: true, avatar: true } },
        requirement: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.requirement.findMany({
      where: { projectId: id },
      include: { submittedBy: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  type Activity = {
    type: string;
    title: string;
    description: string;
    user: string;
    avatar: string | null;
    createdAt: Date;
  };

  const activities: Activity[] = [
    ...statusChanges.map((s) => ({
      type: 'status_change' as const,
      title: s.requirement.title,
      description: `${s.fromStatus} → ${s.toStatus}`,
      user: '',
      avatar: null,
      createdAt: s.createdAt,
    })),
    ...comments.map((c) => ({
      type: 'comment' as const,
      title: c.requirement.title,
      description: c.content.substring(0, 100),
      user: c.author.name,
      avatar: c.author.avatar,
      createdAt: c.createdAt,
    })),
    ...recentReqs.map((r) => ({
      type: 'new_requirement' as const,
      title: r.title,
      description: `New requirement submitted`,
      user: r.submittedBy.name,
      avatar: r.submittedBy.avatar,
      createdAt: r.createdAt,
    })),
  ];

  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json(activities.slice(0, 50));
}
