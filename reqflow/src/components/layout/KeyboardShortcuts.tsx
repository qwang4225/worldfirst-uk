'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { X } from 'lucide-react';

const SHORTCUTS = [
  { key: 'N', desc: 'New Requirement' },
  { key: 'B', desc: 'Kanban Board' },
  { key: 'G', desc: 'Gantt Chart' },
  { key: 'R', desc: 'Requirements List' },
  { key: 'O', desc: 'Project Overview' },
  { key: '⌘K', desc: 'Global Search' },
  { key: '?', desc: 'Show Shortcuts' },
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { openRequirementDrawer, openSearch } = useUIStore();
  const { currentProject } = useProjectStore();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const projectId = currentProject?.id;
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          openRequirementDrawer();
          break;
        case 'b':
          if (projectId) { e.preventDefault(); router.push(`/${locale}/projects/${projectId}/kanban`); }
          break;
        case 'g':
          if (projectId) { e.preventDefault(); router.push(`/${locale}/projects/${projectId}/gantt`); }
          break;
        case 'r':
          if (projectId) { e.preventDefault(); router.push(`/${locale}/projects/${projectId}/requirements`); }
          break;
        case 'o':
          if (projectId) { e.preventDefault(); router.push(`/${locale}/projects/${projectId}/overview`); }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, locale, currentProject, openRequirementDrawer, openSearch]);

  if (!showHelp) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowHelp(false)} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[360px] bg-white rounded-xl shadow-2xl z-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Keyboard Shortcuts</h2>
          <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-slate-600">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-600">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
