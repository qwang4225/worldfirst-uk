'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Eye,
  FileText,
  Columns3,
  GanttChart,
  FolderOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { currentProject } = useProjectStore();

  const projectId = currentProject?.id;

  const workspaceItems: NavItem[] = [
    { label: t('dashboard'), href: `/${locale}/dashboard`, icon: <LayoutDashboard size={20} /> },
    { label: t('myTasks'), href: `/${locale}/dashboard?tab=tasks`, icon: <ListTodo size={20} /> },
    { label: t('myTimeLogs'), href: `/${locale}/dashboard?tab=hours`, icon: <Clock size={20} /> },
  ];

  const projectItems: NavItem[] = projectId
    ? [
        { label: t('overview'), href: `/${locale}/projects/${projectId}/overview`, icon: <Eye size={20} /> },
        { label: t('requirements'), href: `/${locale}/projects/${projectId}/requirements`, icon: <FileText size={20} /> },
        { label: t('kanban'), href: `/${locale}/projects/${projectId}/kanban`, icon: <Columns3 size={20} /> },
        { label: t('gantt'), href: `/${locale}/projects/${projectId}/gantt`, icon: <GanttChart size={20} /> },
        { label: t('files'), href: `/${locale}/projects/${projectId}/files`, icon: <FolderOpen size={20} /> },
        { label: t('membersHours'), href: `/${locale}/projects/${projectId}/members`, icon: <Users size={20} /> },
      ]
    : [];

  const adminItems: NavItem[] = [
    { label: t('allProjects'), href: `/${locale}/dashboard`, icon: <Settings size={20} /> },
  ];

  const isActive = (href: string) => {
    const basePath = href.split('?')[0];
    return pathname === basePath || pathname.startsWith(basePath + '/');
  };

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative',
        isActive(item.href)
          ? 'bg-slate-800 text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-[#0066FF] before:rounded-full'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      )}
      title={sidebarCollapsed ? item.label : undefined}
    >
      {item.icon}
      {!sidebarCollapsed && <span>{item.label}</span>}
    </Link>
  );

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      {!sidebarCollapsed && (
        <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </div>
      )}
      <nav className="space-y-1">{items.map(renderNavItem)}</nav>
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar-bg text-white flex flex-col transition-all duration-200 z-30',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#0066FF]">Req</span>Flow
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-slate-800 text-slate-400"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {renderSection(t('myWorkspace'), workspaceItems)}
        {projectItems.length > 0 && renderSection(t('project'), projectItems)}
        {renderSection(t('admin'), adminItems)}
      </div>

      {/* Bottom section */}
      <div className="border-t border-slate-800 px-2 py-3 space-y-2">
        <LanguageSwitcher collapsed={sidebarCollapsed} />
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
            A
          </div>
          {!sidebarCollapsed && <span>Admin User</span>}
        </div>
      </div>
    </aside>
  );
}
