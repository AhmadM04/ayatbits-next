'use client';

import { Crown, CreditCard, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface BillingSectionProps {
  user: {
    role?: 'admin' | 'user';
    subscriptionStatus?: string;
    subscriptionEndDate?: string;
  };
  stats: {
    planType: string;
  };
}

export default function BillingSection({ user, stats }: BillingSectionProps) {
  const { t } = useI18n();
  
  return (
    <div className="bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white">{t('tutorial.subscriptionBilling')}</h3>
          <p className="text-sm text-[#8E7F71] dark:text-gray-400">{t('tutorial.subscriptionBillingMsg')}</p>
        </div>
      </div>
      
      {user.role !== 'admin' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E5E7EB] dark:border-white/10 transition-colors hover:border-gray-300 dark:hover:border-white/20">
            <div>
              <p className="text-sm text-[#8E7F71] dark:text-gray-400 mb-1">{t('tutorial.currentPlan')}</p>
              <p className="text-lg font-medium text-[#4A3728] dark:text-white capitalize">{stats.planType}</p>
            </div>
            {user.subscriptionEndDate && (
              <div className="text-right">
                <p className="text-sm text-[#8E7F71] dark:text-gray-400 mb-1">
                  {stats.planType === 'trial' ? t('tutorial.trialEnds') : t('tutorial.renewsOn')}
                </p>
                <p className="text-sm font-medium text-[#4A3728] dark:text-white">
                  {new Date(user.subscriptionEndDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/pricing" 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Crown className="w-4 h-4" />
              {stats.planType === 'trial' ? t('tutorial.upgradePlan') : t('tutorial.changePlan')}
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-[#E5E7EB] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-[#4A3728] dark:text-white rounded-xl font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('tutorial.billingAndSubscription')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E5E7EB] dark:border-white/10">
            <p className="text-sm text-[#8E7F71] dark:text-gray-400 mb-2">{t('tutorial.adminAccount')}</p>
            <p className="text-lg font-medium text-[#4A3728] dark:text-white">{t('tutorial.fullAccessGranted')}</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-[#E5E7EB] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-[#4A3728] dark:text-white rounded-xl font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t('tutorial.billingAndSubscription')}
          </Link>
        </div>
      )}
    </div>
  );
}

