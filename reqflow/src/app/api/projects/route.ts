import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      _count: { select: { requirements: true, members: true } },
      requirements: { where: { kanbanColumn: 'DONE' }, select: { id: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const result = projects.map((p) => ({
    id: p.id, name: p.name, nameZh: p.nameZh, status: p.status,
    description: p.description, descriptionZh: p.descriptionZh,
    startDate: p.startDate, endDate: p.endDate,
    _count: { requirements: p._count.requirements },
    memberCount: p._count.members,
    doneCount: p.requirements.length,
    upcomingDeadlines: 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      nameZh: body.nameZh || '',
      description: body.description,
      descriptionZh: body.descriptionZh,
      status: body.status || 'INITIATION',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
