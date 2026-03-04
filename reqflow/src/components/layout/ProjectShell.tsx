'use client';

import { ReactNode, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { cn } from '@/lib/utils';

interface ProjectShellProps {
  children: ReactNode;
  project: {
    id: string;
    name: string;
    nameZh: string;
    description: string | null;
    descriptionZh: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
}

export default function ProjectShell({ children, project }: ProjectShellProps) {
  const { setCurrentProject } = useProjectStore();
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
    return () => setCurrentProject(null);
  }, [project, setCurrentProject]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
