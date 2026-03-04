'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/types';
import type { ProjectStatus } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { CheckCircle2, Clock, TrendingUp, Target, Calendar, ArrowRight } from 'lucide-react';

const STAGES: ProjectStatus[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const STAGE_KEYS = ['initiation', 'planning', 'execution', 'monitoring', 'closure'];
const PIE_COLORS = ['#0066FF', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

interface Stats {
  totalRequirements: number;
  byStatus: Record<string, number>;
  byGoal: Record<string, number>;
  onTimeRate: number;
  thisWeekDone: number;
  velocity: number;
  milestones: { id: string; title: string; dueDate: string; reqCount: number; doneCount: number }[];
  activity: { id: string; type: string; description: string; createdAt: string; userName: string }[];
  requirements: { id: string; title: string; priority: string; goal: string; estimatedHours: number | null }[];
}

export default function OverviewPage() {
  const t = useTranslations();
  const { currentProject } = useProjectStore();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!currentProject) return;
    fetch(`/api/projects/${currentProject.id}/stats`).then((r) => r.json()).then(setStats).catch(() => {});
  }, [currentProject]);

  if (!currentProject) return null;

  const currentStageIdx = STAGES.indexOf(currentProject.status as ProjectStatus);

  const statusChartData = stats ? [
    { name: t('kanban.backlog'), count: stats.byStatus['BACKLOG'] || 0 },
    { name: t('kanban.todo'), count: stats.byStatus['TODO'] || 0 },
    { name: t('kanban.inProgress'), count: stats.byStatus['IN_PROGRESS'] || 0 },
    { name: t('kanban.inReview'), count: stats.byStatus['IN_REVIEW'] || 0 },
    { name: t('kanban.done'), count: stats.byStatus['DONE'] || 0 },
  ] : [];

  const goalData = stats ? Object.entries(stats.byGoal).map(([k, v]) => ({
    name: t(`goal.${k.toLowerCase().replace('_', '')}`), value: v,
  })) : [];

  const scatterData = stats?.requirements?.map((r) => ({
    x: r.estimatedHours || 1, y: r.priority === 'P0' ? 3 : r.priority === 'P1' ? 2 : 1,
    z: r.estimatedHours || 5, name: r.title, priority: r.priority,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stage Stepper */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentProject.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{currentProject.description}</p>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', STATUS_COLORS[currentProject.status as ProjectStatus])}>
            {t(`stage.${STAGE_KEYS[currentStageIdx]}`)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1">
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md text-xs w-full',
                i < currentStageIdx ? 'bg-green-50 text-green-700' :
                i === currentStageIdx ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200' :
                'bg-slate-50 text-slate-400')}>
                {i < currentStageIdx ? <CheckCircle2 size={14} /> : <div className={cn('w-3 h-3 rounded-full border-2', i === currentStageIdx ? 'border-blue-500 bg-blue-500' : 'border-slate-300')} />}
                <span className="font-medium truncate">{t(`stage.${STAGE_KEYS[i]}`)}</span>
              </div>
              {i < STAGES.length - 1 && <ArrowRight size={14} className="shrink-0 text-slate-300 mx-0.5" />}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Target size={20} />, label: t('overview.totalRequirements'), value: stats?.totalRequirements || 0, color: 'text-blue-600 bg-blue-50' },
          { icon: <Clock size={20} />, label: t('overview.onTimeRate'), value: `${stats?.onTimeRate || 0}%`, color: 'text-green-600 bg-green-50' },
          { icon: <CheckCircle2 size={20} />, label: t('overview.thisWeekProgress'), value: stats?.thisWeekDone || 0, color: 'text-violet-600 bg-violet-50' },
          { icon: <TrendingUp size={20} />, label: t('overview.teamVelocity'), value: `${stats?.velocity || 0} ${t('overview.perWeek')}`, color: 'text-amber-600 bg-amber-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('p-2 rounded-lg', kpi.color)}>{kpi.icon}</div>
              <span className="text-sm text-slate-500">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('overview.reqByStatus')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0066FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('overview.goalDistribution')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={goalData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={({ name, percent }: any) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {goalData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('overview.upcomingMilestones')}</h3>
          <div className="space-y-3">
            {stats?.milestones?.length ? stats.milestones.map((ms) => {
              const daysLeft = Math.ceil((new Date(ms.dueDate).getTime() - Date.now()) / 86400000);
              const pct = ms.reqCount > 0 ? Math.round((ms.doneCount / ms.reqCount) * 100) : 0;
              return (
                <div key={ms.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{ms.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </div>
                  <div className={cn('text-xs font-medium', daysLeft < 7 ? 'text-red-600' : 'text-slate-500')}>
                    {daysLeft > 0 ? `${daysLeft} ${t('overview.daysRemaining')}` : 'Overdue'}
                  </div>
                </div>
              );
            }) : <p className="text-sm text-slate-400">{t('empty.noMilestones')}</p>}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('overview.recentActivity')}</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {stats?.activity?.length ? stats.activity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600 shrink-0">{a.userName.charAt(0)}</div>
                <div><p className="text-sm text-slate-700">{a.description}</p><p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</p></div>
              </div>
            )) : <p className="text-sm text-slate-400">{t('empty.noActivity')}</p>}
          </div>
        </div>
      </div>

      {/* Priority Matrix */}
      {scatterData.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('overview.priorityMatrix')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <XAxis dataKey="x" name="Effort (Hours)" type="number" />
              <YAxis dataKey="y" name="Impact" type="number" domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(v: number) => v === 3 ? 'P0' : v === 2 ? 'P1' : 'P2'} />
              <ZAxis dataKey="z" range={[40, 400]} />
              <Tooltip />
              <Scatter data={scatterData} fill="#0066FF">
                {scatterData.map((e, i) => <Cell key={i} fill={e.priority === 'P0' ? '#ef4444' : e.priority === 'P1' ? '#f59e0b' : '#64748b'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
