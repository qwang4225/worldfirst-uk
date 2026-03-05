'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS, KANBAN_STATUS_COLORS } from '@/types';
import type { Priority, KanbanColumn } from '@/types';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface RequirementDetail {
  id: string;
  title: string;
  titleZh: string;
  requester: string;
  contactEmail: string;
  priority: string;
  status: string;
  kanbanColumn: string;
  goal: string;
  goalDetail: string | null;
  successMetric: string | null;
  pageScope: string | null;
  desiredLaunchDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  acceptanceCriteria: string | null;
  dependencies: string | null;
  designNeeded: boolean;
  figmaLink: string | null;
  assignedTo: { name: string } | null;
  submittedBy: { name: string };
}

const KANBAN_KEYS: Record<string, string> = {
  BACKLOG: 'backlog', TODO: 'todo', IN_PROGRESS: 'inProgress', IN_REVIEW: 'inReview', DONE: 'done',
};

export default function RequirementQuickView() {
  const t = useTranslations();
  const locale = useLocale();
  const { requirementDrawerOpen, requirementDrawerId, closeRequirementDrawer, openRequirementDrawer } = useUIStore();
  const { currentProject } = useProjectStore();
  const [req, setReq] = useState<RequirementDetail | null>(null);

  const isViewMode = requirementDrawerOpen && requirementDrawerId && requirementDrawerId.startsWith('view:');
  const viewId = isViewMode ? requirementDrawerId!.replace('view:', '') : null;

  useEffect(() => {
    if (!viewId) { setReq(null); return; }
    fetch(`/api/requirements/${viewId}`)
      .then((r) => r.json())
      .then(setReq)
      .catch(() => setReq(null));
  }, [viewId]);

  if (!isViewMode || !req) return null;

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    value ? (
      <div className="py-2 border-b border-slate-100">
        <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</dt>
        <dd className="mt-0.5 text-sm text-slate-700">{value}</dd>
      </div>
    ) : null
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={closeRequirementDrawer} />
      <div className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 h-14 border-b">
          <h2 className="text-sm font-semibold text-slate-700 truncate flex-1">{locale === 'zh' && req.titleZh ? req.titleZh : req.title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            {currentProject && (
              <Link href={`/${locale}/projects/${currentProject.id}/requirements/${req.id}`}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-[#0066FF]" title="Open full detail">
                <ExternalLink size={16} />
              </Link>
            )}
            <button onClick={() => openRequirementDrawer(req.id)} className="px-2 py-1 text-xs text-[#0066FF] hover:bg-blue-50 rounded">
              {t('common.edit')}
            </button>
            <button onClick={closeRequirementDrawer} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn('px-2 py-0.5 rounded text-xs font-bold border', PRIORITY_COLORS[req.priority as Priority])}>{req.priority}</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className={cn('w-2 h-2 rounded-full', KANBAN_STATUS_COLORS[req.kanbanColumn as KanbanColumn])} />
              {t(`kanban.${KANBAN_KEYS[req.kanbanColumn] || 'backlog'}`)}
            </span>
          </div>

          <dl className="space-y-0">
            <Field label={t('req.requester')} value={req.requester} />
            <Field label={t('req.contactEmail')} value={req.contactEmail} />
            <Field label={t('req.goal')} value={req.goal} />
            <Field label={t('req.goalDetail')} value={req.goalDetail} />
            <Field label={t('req.successMetric')} value={req.successMetric} />
            <Field label={t('req.pageScope')} value={req.pageScope} />
            <Field label={t('req.launchDate')} value={req.desiredLaunchDate ? new Date(req.desiredLaunchDate).toLocaleDateString() : null} />
            <Field label={t('req.estimatedHours')} value={req.estimatedHours ? `${req.estimatedHours}h` : null} />
            <Field label={t('req.actualHours')} value={req.actualHours ? `${req.actualHours}h` : null} />
            <Field label="Submitted by" value={req.submittedBy?.name} />
            <Field label="Assigned to" value={req.assignedTo?.name} />
            <Field label={t('req.designNeeded')} value={req.designNeeded ? t('common.yes') : null} />
            <Field label={t('req.figmaLink')} value={req.figmaLink} />
            <Field label={t('req.acceptance')} value={
              req.acceptanceCriteria ? <pre className="whitespace-pre-wrap text-sm font-sans">{req.acceptanceCriteria}</pre> : null
            } />
            <Field label={t('req.dependencies')} value={req.dependencies} />
          </dl>
        </div>
      </div>
    </>
  );
}
