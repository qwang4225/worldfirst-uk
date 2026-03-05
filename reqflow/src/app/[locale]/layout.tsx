import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import NotificationPanel from '@/components/layout/NotificationPanel';
import KeyboardShortcuts from '@/components/layout/KeyboardShortcuts';
import '../globals.css';

export const metadata = {
  title: 'ReqFlow - Requirements Management',
  description: 'Digital marketing requirements management platform',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
          <NotificationPanel />
          <KeyboardShortcuts />
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
