'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { X, Bell, FileText, MessageSquare, AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Notification {
  id: string; type: string; title: string; message: string; link: string | null;
  isRead: boolean; createdAt: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  NEW_SUBMISSION: FileText, STATUS_CHANGED: CheckCircle, NEW_COMMENT: MessageSquare,
  DEADLINE_APPROACHING: AlertTriangle, MILESTONE_DUE: AlertTriangle, FILE_UPLOADED: Upload,
};

export default function NotificationPanel() {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const { notificationPanelOpen, closeNotificationPanel } = useUIStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!notificationPanelOpen) return;
    fetch('/api/notifications?userId=user-1').then((r) => r.json()).then(setNotifications).catch(() => {});
  }, [notificationPanelOpen]);

  // Polling every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/notifications?userId=user-1').then((r) => r.json()).then(setNotifications).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'user-1' }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  if (!notificationPanelOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={closeNotificationPanel} />
      <div className="fixed right-0 top-0 h-screen w-[380px] max-w-full bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-xs text-[#0066FF] hover:underline">{t('markAllRead')}</button>
            <button onClick={closeNotificationPanel} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
          </div>
        </div>

        <div className="flex gap-1 px-4 py-2 border-b">
          {(['all', 'unread'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1 rounded text-xs font-medium', filter === f ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100')}>
              {t(f)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell size={32} className="mx-auto mb-2" />
              <p className="text-sm">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                return (
                  <div key={n.id}
                    className={cn('px-4 py-3 hover:bg-slate-50 transition-colors', !n.isRead && 'bg-blue-50/50')}>
                    {n.link ? (
                      <Link href={n.link.replace(/^\//, `/${locale}/`)} onClick={closeNotificationPanel} className="flex gap-3">
                        <Icon size={18} className={cn('shrink-0 mt-0.5', !n.isRead ? 'text-[#0066FF]' : 'text-slate-400')} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', !n.isRead ? 'font-medium text-slate-900' : 'text-slate-600')}>{n.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#0066FF] shrink-0 mt-2" />}
                      </Link>
                    ) : (
                      <div className="flex gap-3">
                        <Icon size={18} className={cn('shrink-0 mt-0.5', !n.isRead ? 'text-[#0066FF]' : 'text-slate-400')} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', !n.isRead ? 'font-medium text-slate-900' : 'text-slate-600')}>{n.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
