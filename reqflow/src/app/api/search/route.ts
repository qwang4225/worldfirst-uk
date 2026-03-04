import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const requirements = await prisma.requirement.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { titleZh: { contains: q } },
        { requester: { contains: q } },
        { goalDetail: { contains: q } },
      ],
    },
    include: {
      project: { select: { id: true, name: true } },
    },
    take: 15,
  });

  return NextResponse.json(requirements);
}
