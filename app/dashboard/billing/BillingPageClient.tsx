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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard/profile"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{t('billing.title')}</h1>
              <p className="text-xs text-gray-500">{t('billing.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <BillingContent user={user} />
      </div>
    </div>
  );
}

