'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import RequirementForm from '@/components/forms/RequirementForm';
import { cn } from '@/lib/utils';
import { KANBAN_STATUS_COLORS, PRIORITY_COLORS } from '@/types';
import type { KanbanColumn, Priority } from '@/types';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';

interface GanttReq {
  id: string; title: string; status: string; kanbanColumn: string; priority: string;
  desiredLaunchDate: string | null; estimatedStartDate: string | null;
  estimatedHours: number | null;
  assignedTo: { name: string } | null;
}

interface GanttMilestone {
  id: string; title: string; dueDate: string; completedAt: string | null;
  requirements: GanttReq[];
}

interface GanttData {
  milestones: GanttMilestone[];
  unscheduled: GanttReq[];
  projectStart: string; projectEnd: string;
}

const STATUS_PROGRESS: Record<string, number> = {
  BACKLOG: 0, TODO: 10, IN_PROGRESS: 50, IN_REVIEW: 80, DONE: 100,
};

type ViewMode = 'day' | 'week' | 'month';

export default function GanttPage() {
  const t = useTranslations();
  const { currentProject } = useProjectStore();
  const { openRequirementDrawer } = useUIStore();
  const [data, setData] = useState<GanttData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentProject) return;
    fetch(`/api/projects/${currentProject.id}/gantt`).then((r) => r.json()).then((d) => {
      setData(d);
      const init: Record<string, boolean> = {};
      d.milestones?.forEach((m: GanttMilestone) => { init[m.id] = true; });
      init['unscheduled'] = true;
      setExpanded(init);
    }).catch(() => {});
  }, [currentProject]);

  if (!currentProject || !data) return null;

  const projectStart = new Date(data.projectStart || currentProject.startDate || Date.now());
  const projectEnd = new Date(data.projectEnd || currentProject.endDate || Date.now());
  const totalDays = Math.max(1, Math.ceil((projectEnd.getTime() - projectStart.getTime()) / 86400000));

  const dayWidth = viewMode === 'day' ? 40 : viewMode === 'week' ? 16 : 4;
  const chartWidth = totalDays * dayWidth;

  const getBarPosition = (start: string | null, end: string | null) => {
    const s = start ? new Date(start) : new Date();
    const e = end ? new Date(end) : new Date(s.getTime() + 7 * 86400000);
    const left = Math.max(0, (s.getTime() - projectStart.getTime()) / 86400000) * dayWidth;
    const width = Math.max(dayWidth, ((e.getTime() - s.getTime()) / 86400000) * dayWidth);
    return { left, width };
  };

  const todayOffset = ((Date.now() - projectStart.getTime()) / 86400000) * dayWidth;

  const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderMonthHeaders = () => {
    const months: { label: string; width: number }[] = [];
    const current = new Date(projectStart);
    while (current <= projectEnd) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const end = monthEnd > projectEnd ? projectEnd : monthEnd;
      const days = Math.ceil((end.getTime() - current.getTime()) / 86400000) + 1;
      months.push({ label: current.toLocaleDateString('en', { month: 'short', year: 'numeric' }), width: days * dayWidth });
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    return (
      <div className="flex border-b border-slate-200">
        {months.map((m, i) => (
          <div key={i} style={{ width: m.width }} className="px-2 py-1 text-xs text-slate-500 border-r border-slate-100 truncate">{m.label}</div>
        ))}
      </div>
    );
  };

  const renderTaskBar = (req: GanttReq) => {
    const { left, width } = getBarPosition(req.estimatedStartDate, req.desiredLaunchDate);
    const progress = STATUS_PROGRESS[req.kanbanColumn] || 0;
    return (
      <div className="relative h-8 my-0.5" style={{ width: chartWidth }}>
        <div
          className={cn('absolute top-1 h-6 rounded cursor-pointer hover:opacity-80 flex items-center px-1.5 text-[10px] text-white font-medium overflow-hidden',
            KANBAN_STATUS_COLORS[req.kanbanColumn as KanbanColumn] || 'bg-slate-400'
          )}
          style={{ left, width: Math.max(width, 20) }}
          onClick={() => openRequirementDrawer(req.id)}
        >
          <div className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l" style={{ width: `${progress}%` }} />
          <span className="relative z-10 truncate">{req.title}</span>
          <span className={cn('relative z-10 ml-1 px-1 rounded text-[8px] font-bold', PRIORITY_COLORS[req.priority as Priority])}>{req.priority}</span>
        </div>
      </div>
    );
  };

  const allGroups = [
    ...data.milestones.map((ms) => ({
      id: ms.id, title: ms.title, dueDate: ms.dueDate, isMilestone: true,
      children: ms.requirements, isExpanded: expanded[ms.id],
    })),
    ...(data.unscheduled.length > 0 ? [{
      id: 'unscheduled', title: t('gantt.unscheduled'), dueDate: '', isMilestone: false,
      children: data.unscheduled, isExpanded: expanded['unscheduled'],
    }] : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{t('gantt.title')}</h2>
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setViewMode(v)}
              className={cn('px-3 py-1.5 text-xs rounded-md border', viewMode === v ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
              {t(`gantt.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex">
          {/* Left panel */}
          <div className="w-[300px] shrink-0 border-r border-slate-200">
            <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center text-xs font-medium text-slate-600">
              {t('req.title')}
            </div>
            {allGroups.map((group) => (
              <div key={group.id}>
                <button onClick={() => toggleExpand(group.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border-b border-slate-100">
                  {group.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {group.isMilestone && <Calendar size={14} className="text-blue-500" />}
                  <span className="truncate">{group.title}</span>
                  <span className="text-xs text-slate-400 ml-auto">{group.children.length}</span>
                </button>
                {group.isExpanded && group.children.map((req) => (
                  <div key={req.id} className="flex items-center gap-2 px-6 py-1.5 text-sm text-slate-600 border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                    onClick={() => openRequirementDrawer(req.id)}>
                    <div className={cn('w-2 h-2 rounded-full shrink-0', KANBAN_STATUS_COLORS[req.kanbanColumn as KanbanColumn])} />
                    <span className="truncate">{req.title}</span>
                    {req.assignedTo && <span className="text-xs text-slate-400 ml-auto shrink-0">{req.assignedTo.name.split(' ')[0]}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right panel - chart */}
          <div className="flex-1 overflow-x-auto">
            {renderMonthHeaders()}
            <div className="relative">
              {todayOffset > 0 && todayOffset < chartWidth && (
                <div className="absolute top-0 bottom-0 w-px bg-red-500 z-10" style={{ left: todayOffset }} />
              )}
              {allGroups.map((group) => (
                <div key={group.id}>
                  <div className="h-9 bg-slate-50 border-b border-slate-100 relative" style={{ width: chartWidth }}>
                    {group.isMilestone && group.dueDate && (() => {
                      const pos = getBarPosition(null, group.dueDate);
                      return <div className="absolute top-2.5 w-3 h-3 bg-blue-500 rotate-45" style={{ left: pos.left }} />;
                    })()}
                  </div>
                  {group.isExpanded && group.children.map((req) => (
                    <div key={req.id} className="border-b border-slate-50">{renderTaskBar(req)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RequirementForm projectId={currentProject.id} />
    </div>
  );
}
