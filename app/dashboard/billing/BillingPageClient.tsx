'use client';

import { useI18n } from '@/lib/i18n';
import BillingContent from './BillingContent';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BillingPageClientProps {
  user: {
    role?: 'admin' | 'user';
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    subscriptionEndDate?: string;
    stripeCustomerId?: string;
    hasDirectAccess?: boolean;
  };
}

export default function BillingPageClient({ user }: BillingPageClientProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#4A3728] dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard/profile"
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#4A3728] dark:text-white">{t('billing.title')}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('billing.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <BillingContent user={user} />
      </div>
    </div>
  );
}

