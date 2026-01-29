'use client';

import { Crown, CreditCard, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <CreditCard className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Subscription & Billing</h3>
          <p className="text-sm text-gray-400">Manage your subscription plan</p>
        </div>
      </div>
      
      {user.role !== 'admin' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 transition-colors hover:border-white/20">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Plan</p>
              <p className="text-lg font-medium text-white capitalize">{stats.planType}</p>
            </div>
            {user.subscriptionEndDate && (
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">
                  {stats.planType === 'trial' ? 'Trial ends' : 'Renews on'}
                </p>
                <p className="text-sm font-medium text-white">
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
              <Crown className="w-4 h-4" />
              {stats.planType === 'trial' ? 'Upgrade Plan' : 'Change Plan'}
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Billing & Subscription
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Admin Account</p>
            <p className="text-lg font-medium text-white">Full access granted</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Billing Page
          </Link>
        </div>
      )}
    </div>
  );
}

