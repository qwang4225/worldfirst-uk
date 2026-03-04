'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS, STATUS_COLORS, KANBAN_STATUS_COLORS } from '@/types';
import type { Priority, KanbanColumn, ProjectStatus } from '@/types';
import { Calendar, User, Link2, MessageSquare, Clock, Send, Lock, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ReqDetail {
  id: string; title: string; titleZh: string; requester: string; contactEmail: string;
  desiredLaunchDate: string | null; isHardDeadline: boolean; hardDeadlineReason: string | null;
  goal: string; goalDetail: string | null; successMetric: string | null; successMetricOwner: string | null;
  pageScope: string | null; audience: string | null; targetRegions: string | null;
  contentAssets: string | null; designNeeded: boolean; figmaLink: string | null;
  trackingRequirements: string | null; seoReviewPoints: string | null;
  acceptanceCriteria: string | null; dependencies: string | null;
  priority: string; priorityReason: string | null; status: string; kanbanColumn: string;
  estimatedHours: number | null; actualHours: number | null; tags: string | null;
  createdAt: string; updatedAt: string;
  submittedBy: { name: string; email: string };
  assignedTo: { name: string; email: string } | null;
  project: { name: string; status: string };
  comments: { id: string; content: string; isInternal: boolean; createdAt: string; author: { name: string }; parentId: string | null }[];
  statusHistory: { id: string; fromStatus: string; toStatus: string; createdAt: string }[];
}

export default function RequirementDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const [req, setReq] = useState<ReqDetail | null>(null);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/requirements/${params.reqId}`).then((r) => r.json()).then(setReq).catch(() => {});
  }, [params.reqId]);

  const submitComment = async () => {
    if (!comment.trim() || !req) return;
    setSending(true);
    try {
      const res = await fetch(`/api/requirements/${req.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, isInternal, authorId: 'user-1' }),
      });
      if (res.ok) {
        setComment('');
        const updated = await fetch(`/api/requirements/${req.id}`).then((r) => r.json());
        setReq(updated);
      }
    } catch { toast.error(t('toast.error')); }
    setSending(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('toast.linkCopied'));
  };

  if (!req) return <div className="p-8 text-slate-400">{t('common.loading')}</div>;

  const title = locale === 'zh' && req.titleZh ? req.titleZh : req.title;
  const tags = req.tags ? JSON.parse(req.tags) : [];

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-2 border-b border-slate-100 grid grid-cols-3 gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-700 col-span-2">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span>{req.project.name}</span>
              <span>&middot;</span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[req.project.status as ProjectStatus])}>
                {t(`stage.${req.project.status.toLowerCase()}`)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('px-2 py-1 rounded text-xs font-bold border', PRIORITY_COLORS[req.priority as Priority])}>{req.priority}</span>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', KANBAN_STATUS_COLORS[req.kanbanColumn as KanbanColumn], 'text-white')}>
              {t(`kanban.${req.kanbanColumn === 'IN_PROGRESS' ? 'inProgress' : req.kanbanColumn === 'IN_REVIEW' ? 'inReview' : req.kanbanColumn.toLowerCase()}`)}
            </span>
            <button onClick={copyLink} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title={t('common.copyLink')}>
              <Copy size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><User size={14} />{req.submittedBy.name}</span>
          {req.desiredLaunchDate && <span className="flex items-center gap-1"><Calendar size={14} />{new Date(req.desiredLaunchDate).toLocaleDateString()}</span>}
          {req.estimatedHours && <span className="flex items-center gap-1"><Clock size={14} />{req.estimatedHours}h est.</span>}
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('reqForm.step1')}</h3>
            <dl>
              <InfoRow label={t('req.requester')} value={`${req.requester} (${req.contactEmail})`} />
              <InfoRow label={t('req.launchDate')} value={req.desiredLaunchDate ? new Date(req.desiredLaunchDate).toLocaleDateString() : null} />
              <InfoRow label={t('req.isHardDDL')} value={req.isHardDeadline ? `${t('common.yes')} - ${req.hardDeadlineReason || ''}` : t('common.no')} />
              <InfoRow label={t('req.priority')} value={<span className={cn('px-1.5 py-0.5 rounded text-xs font-bold border', PRIORITY_COLORS[req.priority as Priority])}>{req.priority}</span>} />
              {req.priorityReason && <InfoRow label={t('req.priorityReason')} value={req.priorityReason} />}
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('reqForm.step2')}</h3>
            <dl>
              <InfoRow label={t('req.goal')} value={t(`goal.${req.goal.toLowerCase().replace('_', '')}`)} />
              <InfoRow label={t('req.goalDetail')} value={req.goalDetail} />
              <InfoRow label={t('req.successMetric')} value={req.successMetric} />
              <InfoRow label={t('req.successMetricOwner')} value={req.successMetricOwner} />
            </dl>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('reqForm.step3')}</h3>
            <dl>
              <InfoRow label={t('req.pageScope')} value={req.pageScope} />
              <InfoRow label={t('req.audience')} value={req.audience ? JSON.parse(req.audience).join(', ') : null} />
              <InfoRow label={t('req.targetRegions')} value={req.targetRegions ? JSON.parse(req.targetRegions).join(', ') : null} />
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('reqForm.step4')}</h3>
            <dl>
              <InfoRow label={t('req.designNeeded')} value={req.designNeeded ? t('common.yes') : t('common.no')} />
              {req.figmaLink && <InfoRow label={t('req.figmaLink')} value={<a href={req.figmaLink} className="text-blue-600 hover:underline flex items-center gap-1"><Link2 size={14} />{req.figmaLink}</a>} />}
              <InfoRow label={t('req.tracking')} value={req.trackingRequirements} />
              <InfoRow label={t('req.seoReview')} value={req.seoReviewPoints} />
              <InfoRow label={t('req.dependencies')} value={req.dependencies} />
            </dl>
          </div>
        </div>

        {(req.acceptanceCriteria || tags.length > 0) && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('reqForm.step5')}</h3>
            <dl>
              <InfoRow label={t('req.acceptance')} value={req.acceptanceCriteria} />
              {tags.length > 0 && <InfoRow label={t('req.tags')} value={<div className="flex flex-wrap gap-1">{tags.map((tag: string) => <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>)}</div>} />}
            </dl>
          </div>
        )}
      </div>

      {/* Status History */}
      {req.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Status History</h3>
          <div className="space-y-2">
            {req.statusHistory.map((sh) => (
              <div key={sh.id} className="flex items-center gap-3 text-sm">
                <span className="text-slate-400 text-xs w-32">{new Date(sh.createdAt).toLocaleString()}</span>
                <span className="text-slate-500">{sh.fromStatus}</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="font-medium text-slate-700">{sh.toStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare size={16} /> Comments ({req.comments.length})
        </h3>
        <div className="space-y-4 mb-6">
          {req.comments.map((c) => (
            <div key={c.id} className={cn('p-3 rounded-lg', c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50')}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-white font-medium">{c.author.name.charAt(0)}</div>
                <span className="text-sm font-medium text-slate-700">{c.author.name}</span>
                {c.isInternal && <Lock size={12} className="text-amber-500" />}
                <span className="text-xs text-slate-400 ml-auto">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-600 ml-8">{c.content}</p>
            </div>
          ))}
          {req.comments.length === 0 && <p className="text-sm text-slate-400">No comments yet</p>}
        </div>

        {/* Add Comment */}
        <div className="space-y-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded border-slate-300" />
              <Lock size={14} />{t('req.internalComments')}
            </label>
            <button onClick={submitComment} disabled={!comment.trim() || sending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF] text-white rounded-md text-sm font-medium hover:bg-[#0052cc] disabled:opacity-50">
              <Send size={14} />{t('common.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
