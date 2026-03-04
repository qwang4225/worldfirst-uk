import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const members = await prisma.projectMember.findMany({
    where: { projectId: id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
    },
  });

  const result = await Promise.all(
    members.map(async (m) => {
      const [reqCount, totalHours] = await Promise.all([
        prisma.requirement.count({ where: { projectId: id, assignedToId: m.userId } }),
        prisma.workLog.aggregate({ where: { projectId: id, userId: m.userId }, _sum: { hours: true } }),
      ]);
      return {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.user.role,
        memberRole: m.role,
        joinedAt: m.joinedAt.toISOString(),
        reqCount,
        totalHours: totalHours._sum.hours || 0,
      };
    })
  );

  return NextResponse.json(result);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const member = await prisma.projectMember.create({
    data: { projectId: id, userId: body.userId, role: body.role || 'MEMBER' },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });
  return NextResponse.json(member, { status: 201 });
}
