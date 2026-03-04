import { ReactNode } from 'react';
import prisma from '@/lib/prisma';
import ProjectShell from '@/components/layout/ProjectShell';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameZh: true,
      description: true,
      descriptionZh: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  const serialized = project
    ? {
        ...project,
        startDate: project.startDate?.toISOString() ?? null,
        endDate: project.endDate?.toISOString() ?? null,
      }
    : null;

  return <ProjectShell project={serialized}>{children}</ProjectShell>;
}
