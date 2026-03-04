'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Clock, Users, X } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string; name: string; email: string; role: string; avatar: string | null;
  joinedAt: string; memberRole: string; reqCount: number; totalHours: number;
}

interface WorkLogEntry {
  id: string; date: string; hours: number; description: string | null;
  user: { name: string }; requirement: { title: string } | null;
}

export default function MembersPage() {
  const t = useTranslations();
  const { currentProject } = useProjectStore();
  const [tab, setTab] = useState<'members' | 'hours'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<WorkLogEntry[]>([]);
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [logForm, setLogForm] = useState({ userId: '', date: new Date().toISOString().split('T')[0], hours: '1', description: '' });

  const loadMembers = useCallback(async () => {
    if (!currentProject) return;
    const r = await fetch(`/api/projects/${currentProject.id}/members`);
    if (r.ok) setMembers(await r.json());
  }, [currentProject]);

  const loadLogs = useCallback(async () => {
    if (!currentProject) return;
    const r = await fetch(`/api/projects/${currentProject.id}/worklogs`);
    if (r.ok) setLogs(await r.json());
  }, [currentProject]);

  useEffect(() => { loadMembers(); loadLogs(); }, [loadMembers, loadLogs]);

  const submitLog = async () => {
    if (!currentProject) return;
    try {
      const res = await fetch('/api/worklogs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...logForm, projectId: currentProject.id, hours: parseFloat(logForm.hours), date: new Date(logForm.date) }),
      });
      if (res.ok) { toast.success(t('toast.hourLogged')); setLogDrawerOpen(false); loadLogs(); }
    } catch { toast.error(t('toast.error')); }
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });

  const weeklyData = members.map((m) => {
    const row: Record<string, number | string> = { name: m.name };
    let total = 0;
    last7Days.forEach((day) => {
      const hrs = logs.filter((l) => l.user.name === m.name && l.date.startsWith(day)).reduce((s, l) => s + l.hours, 0);
      row[day] = hrs; total += hrs;
    });
    row.total = total;
    return row;
  });

  const memberHoursData = members.map((m) => ({ name: m.name, hours: m.totalHours })).sort((a, b) => b.hours - a.hours);

  if (!currentProject) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
        {([{ key: 'members' as const, label: t('members.title'), icon: <Users size={16} /> }, { key: 'hours' as const, label: t('members.workHours'), icon: <Clock size={16} /> }]).map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={cn('flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px',
              tab === tb.key ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-slate-500 hover:text-slate-700')}>
            {tb.icon}{tb.label}
          </button>
        ))}
      </div>

      {tab === 'members' ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr>
              {['', 'Name', t('members.role'), 'Email', t('members.joinedDate'), t('members.assignedReqs'), t('members.totalHours')].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">{m.name.charAt(0)}</div></td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{m.memberRole}</span></td>
                  <td className="px-4 py-3 text-slate-500">{m.email}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{m.reqCount}</td>
                  <td className="px-4 py-3 text-slate-600">{m.totalHours.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setLogDrawerOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#0066FF] text-white rounded-md text-sm font-medium hover:bg-[#0052cc]">
              <Plus size={16} />{t('members.logHours')}
            </button>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('members.weeklySummary')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Name</th>
                  {last7Days.map((d) => (<th key={d} className="px-3 py-2 text-center font-medium text-slate-600 text-xs">{new Date(d).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}</th>))}
                  <th className="px-3 py-2 text-center font-medium text-slate-700">Total</th>
                </tr></thead>
                <tbody>
                  {weeklyData.map((row) => (
                    <tr key={row.name as string} className="border-b border-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-700">{row.name}</td>
                      {last7Days.map((d) => { const hrs = (row[d] as number) || 0; return (
                        <td key={d} className="px-3 py-2 text-center">
                          <span className={cn('inline-block w-8 h-8 leading-8 rounded text-xs',
                            hrs === 0 ? 'bg-slate-50 text-slate-300' : hrs <= 4 ? 'bg-sky-100 text-sky-700' : hrs <= 8 ? 'bg-sky-300 text-sky-900' : 'bg-sky-500 text-white')}>
                            {hrs > 0 ? hrs.toFixed(1) : '-'}
                          </span>
                        </td>); })}
                      <td className="px-3 py-2 text-center font-semibold text-slate-700">{(row.total as number).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('members.workloadDistribution')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={memberHoursData}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="hours" fill="#0066FF" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {logDrawerOpen && (<>
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setLogDrawerOpen(false)} />
        <div className="fixed right-0 top-0 h-screen w-[400px] max-w-full bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 h-14 border-b">
            <h2 className="text-lg font-semibold">{t('members.logHours')}</h2>
            <button onClick={() => setLogDrawerOpen(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">User</label>
              <select value={logForm.userId} onChange={(e) => setLogForm((f) => ({ ...f, userId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                <option value="">Select user</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">{t('members.date')}</label>
              <input type="date" value={logForm.date} onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">{t('members.hours')}</label>
              <input type="number" min="0.5" max="24" step="0.5" value={logForm.hours} onChange={(e) => setLogForm((f) => ({ ...f, hours: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea value={logForm.description} onChange={(e) => setLogForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
          </div>
          <div className="px-6 py-3 border-t">
            <button onClick={submitLog} className="w-full px-4 py-2 bg-[#0066FF] text-white rounded-md text-sm font-medium hover:bg-[#0052cc]">{t('common.save')}</button>
          </div>
        </div>
      </>)}
    </div>
  );
}
