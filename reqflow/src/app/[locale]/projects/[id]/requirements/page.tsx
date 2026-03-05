'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import RequirementForm from '@/components/forms/RequirementForm';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS, KANBAN_STATUS_COLORS } from '@/types';
import type { KanbanColumn, Priority } from '@/types';
import { Plus, Search, Download } from 'lucide-react';

interface Req {
  id: string; title: string; titleZh: string; priority: string; goal: string;
  desiredLaunchDate: string | null; estimatedHours: number | null;
  kanbanColumn: string; status: string; requester: string;
  assignedTo: { name: string } | null;
  submittedBy: { name: string };
}

const KANBAN_KEYS: Record<string, string> = {
  BACKLOG: 'backlog', TODO: 'todo', IN_PROGRESS: 'inProgress', IN_REVIEW: 'inReview', DONE: 'done',
};

export default function RequirementsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { currentProject } = useProjectStore();
  const { openRequirementDrawer } = useUIStore();
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (priority) p.set('priority', priority);
    if (status) p.set('kanbanColumn', status);
    const r = await fetch(`/api/projects/${currentProject.id}/requirements?${p}`);
    if (r.ok) setReqs(await r.json());
    setLoading(false);
  }, [currentProject, search, priority, status]);

  const exportCsv = () => {
    if (!currentProject) return;
    window.open(`/api/projects/${currentProject.id}/export?format=csv`, '_blank');
  };

  useEffect(() => { load(); }, [load]);

  if (!currentProject) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{t('nav.requirements')}</h2>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50">
            <Download size={16} />{t('common.export')}
          </button>
          <button onClick={() => openRequirementDrawer()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0066FF] text-white rounded-md text-sm font-medium hover:bg-[#0052cc]">
            <Plus size={16} />{t('req.newRequirement')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')}
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-md text-sm w-56 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
          <option value="">{t('req.priority')}: All</option>
          <option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
          <option value="">Status: All</option>
          {Object.entries(KANBAN_KEYS).map(([k, v]) => <option key={k} value={k}>{t(`kanban.${v}`)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {[t('req.title'), t('req.priority'), 'Status', t('req.requester'), t('req.goal'), t('req.launchDate'), t('req.estimatedHours')].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reqs.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/${locale}/projects/${currentProject.id}/requirements/${r.id}`} className="font-medium text-slate-700 hover:text-[#0066FF]">
                    {locale === 'zh' && r.titleZh ? r.titleZh : r.title}
                  </Link>
                </td>
                <td className="px-4 py-3"><span className={cn('px-1.5 py-0.5 rounded text-xs font-bold border', PRIORITY_COLORS[r.priority as Priority])}>{r.priority}</span></td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', KANBAN_STATUS_COLORS[r.kanbanColumn as KanbanColumn])} />
                    {t(`kanban.${KANBAN_KEYS[r.kanbanColumn] || 'backlog'}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.requester}</td>
                <td className="px-4 py-3 text-slate-600">{t(`goal.${r.goal.toLowerCase().replace('_', '')}`)}</td>
                <td className="px-4 py-3 text-slate-600">{r.desiredLaunchDate ? new Date(r.desiredLaunchDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-slate-600">{r.estimatedHours || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && reqs.length === 0 && (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-3 flex gap-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-48" />
                <div className="h-4 bg-slate-200 rounded w-12" />
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        )}
        {!loading && reqs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">{t('empty.noRequirements')}</p>
            <p className="text-xs mt-1">{t('empty.noRequirementsDesc')}</p>
          </div>
        )}
      </div>

      <RequirementForm projectId={currentProject.id} />
    </div>
  );
}
