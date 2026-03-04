'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import Sidebar from '@/components/layout/Sidebar';
import { STATUS_COLORS, PRIORITY_COLORS } from '@/types';
import type { ProjectStatus, Priority } from '@/types';
import { Clock, AlertTriangle, Calendar, ArrowRight, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface MyReq {
  id: string; title: string; priority: string; status: string; kanbanColumn: string;
  desiredLaunchDate: string | null; project: { id: string; name: string };
}

interface ProjectSummary {
  id: string; name: string; nameZh: string; status: string;
  _count: { requirements: number };
  doneCount: number; memberCount: number; upcomingDeadlines: number;
}

interface Activity {
  id: string; type: string; description: string; createdAt: string; projectName: string;
}

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { sidebarCollapsed, searchOpen, openSearch, closeSearch } = useUIStore();
  const [myReqs, setMyReqs] = useState<MyReq[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [hours, setHours] = useState({ weekHours: 0, todayHours: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MyReq[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', nameZh: '', description: '', startDate: '', endDate: '' });
  const [tab, setTab] = useState<'inProgress' | 'dueSoon' | 'all'>('all');

  useEffect(() => {
    fetch('/api/dashboard/my-requirements').then((r) => r.json()).then(setMyReqs).catch(() => {});
    fetch('/api/projects').then((r) => r.json()).then(setProjects).catch(() => {});
    fetch('/api/dashboard/my-hours').then((r) => r.json()).then(setHours).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch, closeSearch]);

  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()).then(setSearchResults).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredReqs = myReqs.filter((r) => {
    if (tab === 'inProgress') return r.kanbanColumn === 'IN_PROGRESS';
    if (tab === 'dueSoon') {
      if (!r.desiredLaunchDate) return false;
      const days = Math.ceil((new Date(r.desiredLaunchDate).getTime() - Date.now()) / 86400000);
      return days <= 7 && days >= 0;
    }
    return true;
  });

  const createProject = async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        toast.success(t('toast.saved'));
        setShowNewProject(false);
        const updated = await fetch('/api/projects').then((r) => r.json());
        setProjects(updated);
      }
    } catch { toast.error(t('toast.error')); }
  };

  const overdueReqs = myReqs.filter((r) => {
    if (!r.desiredLaunchDate || r.kanbanColumn === 'DONE') return false;
    return new Date(r.desiredLaunchDate) < new Date();
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn('transition-all duration-200', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.myWork')}</h1>
            <button onClick={openSearch} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-500 hover:bg-slate-50">
              <Search size={16} />{t('common.search')}<kbd className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: My Work */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">{t('dashboard.myRequirements')}</h2>
                <div className="flex gap-1 mb-3">
                  {(['all', 'inProgress', 'dueSoon'] as const).map((tb) => (
                    <button key={tb} onClick={() => setTab(tb)}
                      className={cn('px-2.5 py-1 rounded text-xs font-medium', tab === tb ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100')}>
                      {t(`dashboard.${tb}Tab`)}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredReqs.map((r) => (
                    <Link key={r.id} href={`/${locale}/projects/${r.project.id}/requirements/${r.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100">
                      <span className={cn('px-1 py-0.5 rounded text-[10px] font-bold border', PRIORITY_COLORS[r.priority as Priority])}>{r.priority}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">{r.title}</div>
                        <div className="text-xs text-slate-400">{r.project.name}</div>
                      </div>
                      {r.desiredLaunchDate && (
                        <span className="text-xs text-slate-400">{new Date(r.desiredLaunchDate).toLocaleDateString()}</span>
                      )}
                    </Link>
                  ))}
                  {filteredReqs.length === 0 && <p className="text-sm text-slate-400 text-center py-4">{t('empty.noRequirements')}</p>}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-2">{t('dashboard.myTimeThisWeek')}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{hours.weekHours.toFixed(1)}</span>
                  <span className="text-sm text-slate-400">h this week</span>
                </div>
                <div className="text-xs text-slate-500 mt-1"><Clock size={12} className="inline mr-1" />{hours.todayHours.toFixed(1)}h today</div>
              </div>
            </div>

            {/* Column 2: Projects */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-700">{t('dashboard.projectsOverview')}</h2>
                  <button onClick={() => setShowNewProject(true)} className="flex items-center gap-1 text-xs text-[#0066FF] hover:text-[#0052cc]">
                    <Plus size={14} />{t('project.newProject')}
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.map((p) => {
                    const totalReqs = p._count?.requirements || 0;
                    const donePercent = totalReqs > 0 ? Math.round((p.doneCount / totalReqs) * 100) : 0;
                    return (
                      <Link key={p.id} href={`/${locale}/projects/${p.id}/overview`}
                        className="block p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-slate-700">{locale === 'zh' && p.nameZh ? p.nameZh : p.name}</h3>
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', STATUS_COLORS[p.status as ProjectStatus])}>
                            {t(`stage.${p.status.toLowerCase()}`)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${donePercent}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{donePercent}%</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{totalReqs} reqs</span>
                          <span>{p.memberCount} members</span>
                        </div>
                      </Link>
                    );
                  })}
                  {projects.length === 0 && <p className="text-sm text-slate-400 text-center py-4">{t('empty.noRequirements')}</p>}
                </div>
              </div>
            </div>

            {/* Column 3: Alerts */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">{t('dashboard.activityAlerts')}</h2>
                {overdueReqs.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-red-600 flex items-center gap-1 mb-2">
                      <AlertTriangle size={14} />{t('dashboard.overdueReqs')}
                    </h3>
                    <div className="space-y-1.5">
                      {overdueReqs.map((r) => (
                        <Link key={r.id} href={`/${locale}/projects/${r.project.id}/requirements/${r.id}`}
                          className="flex items-center gap-2 p-2 rounded bg-red-50 border border-red-100 text-sm">
                          <span className="text-red-600 font-medium truncate flex-1">{r.title}</span>
                          <span className="text-xs text-red-400 shrink-0">{r.project.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {overdueReqs.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">{t('empty.noActivity')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={closeSearch} />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[560px] max-w-[90vw] bg-white rounded-xl shadow-2xl z-50">
            <div className="flex items-center gap-3 px-4 border-b">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                placeholder={`${t('common.search')}...`}
                className="flex-1 py-4 text-sm outline-none" />
              <button onClick={closeSearch} className="text-slate-400"><X size={18} /></button>
            </div>
            {searchResults.length > 0 && (
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {searchResults.map((r) => (
                  <Link key={r.id} href={`/${locale}/projects/${r.project.id}/requirements/${r.id}`} onClick={closeSearch}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50">
                    <span className={cn('px-1 py-0.5 rounded text-[10px] font-bold border', PRIORITY_COLORS[r.priority as Priority])}>{r.priority}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{r.title}</div>
                      <div className="text-xs text-slate-400">{r.project.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowNewProject(false)} />
          <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[480px] max-w-[90vw] bg-white rounded-xl shadow-2xl z-50 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('project.newProject')}</h2>
            <div className="space-y-3">
              <input type="text" placeholder={t('project.projectName')} value={newProject.name}
                onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              <input type="text" placeholder={t('project.projectNameZh')} value={newProject.nameZh}
                onChange={(e) => setNewProject((p) => ({ ...p, nameZh: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              <textarea placeholder={t('project.description')} value={newProject.description}
                onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-500 mb-1">{t('project.startDate')}</label>
                  <input type="date" value={newProject.startDate} onChange={(e) => setNewProject((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">{t('project.endDate')}</label>
                  <input type="date" value={newProject.endDate} onChange={(e) => setNewProject((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowNewProject(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">{t('common.cancel')}</button>
              <button onClick={createProject} className="px-4 py-2 text-sm bg-[#0066FF] text-white rounded-md hover:bg-[#0052cc]">{t('common.create')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
