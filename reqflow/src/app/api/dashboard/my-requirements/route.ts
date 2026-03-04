import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || 'user-1';

  const requirements = await prisma.requirement.findMany({
    where: {
      OR: [
        { assignedToId: userId },
        { submittedById: userId },
      ],
    },
    include: {
      project: { select: { id: true, name: true, nameZh: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  });

  return NextResponse.json(requirements);
}
