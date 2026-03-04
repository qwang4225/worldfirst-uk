'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export default function LanguageSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-slate-700 text-slate-400 hover:text-slate-200"
    >
      {locale === 'en' ? '🇬🇧' : '🇨🇳'}
      {!collapsed && (
        <span>{locale === 'en' ? 'EN' : '中文'}</span>
      )}
    </button>
  );
}
