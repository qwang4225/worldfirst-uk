'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import RequirementForm from '@/components/forms/RequirementForm';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS, KANBAN_STATUS_COLORS } from '@/types';
import type { KanbanColumn, Priority } from '@/types';
import { MessageSquare, Paperclip, Calendar, Plus, Search, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

interface Req {
  id: string; title: string; titleZh: string; priority: string; goal: string;
  desiredLaunchDate: string | null; estimatedHours: number | null; kanbanColumn: string;
  sortOrder: number; requester: string;
  submittedBy: { id: string; name: string; avatar: string | null };
  assignedTo: { id: string; name: string; avatar: string | null } | null;
  _count: { comments: number; attachments: number };
}

const COLUMNS: { key: KanbanColumn; tKey: string }[] = [
  { key: 'BACKLOG', tKey: 'backlog' }, { key: 'TODO', tKey: 'todo' },
  { key: 'IN_PROGRESS', tKey: 'inProgress' }, { key: 'IN_REVIEW', tKey: 'inReview' },
  { key: 'DONE', tKey: 'done' },
];

function Card({ req, onClick }: { req: Req; onClick: () => void }) {
  const locale = useLocale();
  const t = useTranslations();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: req.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const title = locale === 'zh' && req.titleZh ? req.titleZh : req.title;
  const dueDate = req.desiredLaunchDate ? new Date(req.desiredLaunchDate) : null;
  const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900 line-clamp-2 flex-1">{title}</h4>
        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 border', PRIORITY_COLORS[req.priority as Priority])}>{req.priority}</span>
      </div>
      <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
        {t(`goal.${req.goal.toLowerCase().replace('_', '')}`)}
      </span>
      {dueDate && (
        <div className={cn('flex items-center gap-1 text-xs', daysLeft !== null && daysLeft < 0 ? 'text-red-600' : daysLeft !== null && daysLeft < 7 ? 'text-amber-600' : 'text-slate-500')}>
          <Calendar size={12} />{dueDate.toLocaleDateString()}
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[9px] text-white font-medium">
            {(req.assignedTo?.name || req.submittedBy.name).charAt(0)}
          </div>
          {req.estimatedHours && <span className="text-[10px] text-slate-400">{req.estimatedHours}h</span>}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          {req._count.comments > 0 && <span className="flex items-center gap-0.5 text-[10px]"><MessageSquare size={10} />{req._count.comments}</span>}
          {req._count.attachments > 0 && <span className="flex items-center gap-0.5 text-[10px]"><Paperclip size={10} />{req._count.attachments}</span>}
        </div>
      </div>
    </div>
  );
}

function Column({ column, reqs, onCardClick, onAdd }: {
  column: { key: KanbanColumn; tKey: string }; reqs: Req[]; onCardClick: (id: string) => void; onAdd: () => void;
}) {
  const t = useTranslations('kanban');
  const hrs = reqs.reduce((s, r) => s + (r.estimatedHours || 0), 0);
  return (
    <div className="flex-1 min-w-[240px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', KANBAN_STATUS_COLORS[column.key])} />
          <h3 className="text-sm font-semibold text-slate-700">{t(column.tKey)}</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{reqs.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {hrs > 0 && <span className="text-[10px] text-slate-400">{hrs}h</span>}
          <button onClick={onAdd} className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Plus size={16} /></button>
        </div>
      </div>
      <SortableContext items={reqs.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px] p-1 rounded-lg bg-slate-100/50">
          {reqs.map((r) => <Card key={r.id} req={r} onClick={() => onCardClick(r.id)} />)}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanPage() {
  const t = useTranslations();
  const { currentProject } = useProjectStore();
  const { openRequirementDrawer } = useUIStore();
  const [reqs, setReqs] = useState<Req[]>([]);
  const [activeReq, setActiveReq] = useState<Req | null>(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [view, setView] = useState<'board' | 'list'>('board');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    if (!currentProject) return;
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (priority) p.set('priority', priority);
    const r = await fetch(`/api/projects/${currentProject.id}/requirements?${p}`);
    if (r.ok) setReqs(await r.json());
  }, [currentProject, search, priority]);

  useEffect(() => { load(); }, [load]);

  const colReqs = (c: KanbanColumn) => reqs.filter((r) => r.kanbanColumn === c).sort((a, b) => a.sortOrder - b.sortOrder);

  const onDragStart = (e: DragStartEvent) => setActiveReq(reqs.find((r) => r.id === e.active.id) || null);

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveReq(null);
    const { active, over } = e;
    if (!over) return;
    const req = reqs.find((r) => r.id === active.id);
    if (!req) return;
    const overReq = reqs.find((r) => r.id === over.id);
    const target = overReq ? overReq.kanbanColumn : req.kanbanColumn;
    if (target !== req.kanbanColumn) {
      setReqs((prev) => prev.map((r) => r.id === req.id ? { ...r, kanbanColumn: target } : r));
      try {
        await fetch(`/api/requirements/${req.id}/move`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kanbanColumn: target, sortOrder: req.sortOrder }),
        });
        toast.success(t('toast.statusUpdated'));
        load();
      } catch { toast.error(t('toast.error')); load(); }
    }
  };

  if (!currentProject) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')}
              className="pl-8 pr-3 py-2 border border-slate-200 rounded-md text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">{t('req.priority')}: {t('dashboard.allTab')}</option>
            <option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option>
          </select>
        </div>
        <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5">
          <button onClick={() => setView('board')} className={cn('p-1.5 rounded', view === 'board' ? 'bg-slate-100 text-slate-700' : 'text-slate-400')}><LayoutGrid size={16} /></button>
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded', view === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400')}><List size={16} /></button>
        </div>
      </div>

      {view === 'board' ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((c) => <Column key={c.key} column={c} reqs={colReqs(c.key)} onCardClick={(id) => openRequirementDrawer(id)} onAdd={() => openRequirementDrawer()} />)}
          </div>
          <DragOverlay>{activeReq && <Card req={activeReq} onClick={() => {}} />}</DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>{['ID', t('req.title'), t('req.priority'), 'Status', t('req.requester'), t('req.goal'), t('req.launchDate'), t('req.estimatedHours')].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reqs.map((r) => (
                <tr key={r.id} onClick={() => openRequirementDrawer(r.id)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3"><span className={cn('px-1.5 py-0.5 rounded text-xs font-bold border', PRIORITY_COLORS[r.priority as Priority])}>{r.priority}</span></td>
                  <td className="px-4 py-3"><span className={cn('w-2 h-2 rounded-full inline-block mr-1.5', KANBAN_STATUS_COLORS[r.kanbanColumn as KanbanColumn])} />{t(`kanban.${COLUMNS.find((c) => c.key === r.kanbanColumn)?.tKey || 'backlog'}`)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.requester}</td>
                  <td className="px-4 py-3 text-slate-600">{t(`goal.${r.goal.toLowerCase().replace('_', '')}`)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.desiredLaunchDate ? new Date(r.desiredLaunchDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.estimatedHours || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RequirementForm projectId={currentProject.id} />
    </div>
  );
}
