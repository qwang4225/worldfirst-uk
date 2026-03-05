'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              <span className="text-[#0066FF]">Req</span>Flow
            </h1>
            <p className="text-sm text-slate-500 mt-1">{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@reqflow.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0066FF] text-white rounded-md text-sm font-medium hover:bg-[#0052cc] disabled:opacity-50"
            >
              {loading ? '...' : t('login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleGuest}
              className="text-sm text-slate-500 hover:text-[#0066FF] underline"
            >
              {t('continueAsGuest')}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2">Demo accounts:</p>
            <div className="text-xs text-slate-400 space-y-0.5">
              <p>alice@reqflow.com (Admin)</p>
              <p>bob@reqflow.com (PM)</p>
              <p>carol@reqflow.com (Developer)</p>
              <p className="text-slate-300">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
