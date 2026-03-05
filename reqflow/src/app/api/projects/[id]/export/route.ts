import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'csv';

  const requirements = await prisma.requirement.findMany({
    where: { projectId: id },
    include: {
      submittedBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const headers = [
      'Title', 'Priority', 'Status', 'Kanban Column', 'Requester', 'Goal',
      'Desired Launch Date', 'Estimated Hours', 'Actual Hours',
      'Submitted By', 'Assigned To', 'Created At',
    ];

    const rows = requirements.map((r) => [
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.priority,
      r.status,
      r.kanbanColumn,
      `"${(r.requester || '').replace(/"/g, '""')}"`,
      r.goal,
      r.desiredLaunchDate ? r.desiredLaunchDate.toISOString().split('T')[0] : '',
      r.estimatedHours ?? '',
      r.actualHours ?? '',
      r.submittedBy?.name || '',
      r.assignedTo?.name || '',
      r.createdAt.toISOString().split('T')[0],
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="requirements-${id}.csv"`,
      },
    });
  }

  return NextResponse.json(requirements);
}
