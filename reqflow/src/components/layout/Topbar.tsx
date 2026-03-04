'use client';

import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { Plus, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/types';
import type { ProjectStatus } from '@/types';

export default function Topbar() {
  const t = useTranslations();
  const { currentProject } = useProjectStore();
  const { openRequirementDrawer, toggleNotificationPanel, openSearch } = useUIStore();

  const statusKey = (currentProject?.status || 'INITIATION') as ProjectStatus;
  const stageKey = statusKey.toLowerCase() as 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closure';

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {currentProject ? (
          <>
            <h1 className="text-lg font-semibold text-slate-900">
              {currentProject.name}
            </h1>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-medium',
                STATUS_COLORS[statusKey]
              )}
            >
              {t(`stage.${stageKey}`)}
            </span>
          </>
        ) : (
          <h1 className="text-lg font-semibold text-slate-900">{t('app.name')}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-500 hover:border-slate-300 hover:bg-slate-50"
        >
          <Search size={16} />
          <span className="hidden md:inline">{t('common.search')}</span>
          <kbd className="hidden md:inline text-xs bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <button
          onClick={() => openRequirementDrawer()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF] text-white rounded-md text-sm font-medium hover:bg-[#0052cc] transition-colors"
        >
          <Plus size={16} />
          <span className="hidden md:inline">{t('req.newRequirement')}</span>
        </button>

        <button
          onClick={toggleNotificationPanel}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
