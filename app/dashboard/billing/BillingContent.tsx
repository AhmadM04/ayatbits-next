'use client';

import { useState } from 'react';
import { CreditCard, ExternalLink, Loader2, CheckCircle2, XCircle, Calendar, Crown } from 'lucide-react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface BillingContentProps {
  user: {
    role?: 'admin' | 'user';
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    subscriptionEndDate?: string;
    stripeCustomerId?: string;
  };
}

export default function BillingContent({ user }: BillingContentProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenBillingPortal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Failed to open billing portal', 'error');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      showToast('Failed to open billing portal', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (user.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Admin Account</h3>
              <p className="text-sm text-gray-400">You have full access as an administrator</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = user.subscriptionStatus || 'trial';
    const plan = user.subscriptionPlan || 'trial';

    if (status === 'active' || status === 'trialing') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{plan}</span>
        </div>
      );
    } else if (status === 'past_due' || status === 'unpaid') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Payment Required</span>
        </div>
      );
    } else if (status === 'canceled') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Canceled</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Trial</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-400">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Current Plan</h3>
              <p className="text-sm text-gray-400">Your active subscription details</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Plan Type</p>
              <p className="text-lg font-medium text-white capitalize">
                {user.subscriptionPlan || 'Trial'}
              </p>
            </div>
            {user.subscriptionEndDate && (
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">
                  {user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
                    ? 'Renews on'
                    : 'Expires on'}
                </p>
                <p className="text-lg font-medium text-white">
                  {new Date(user.subscriptionEndDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {!user.stripeCustomerId && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-sm text-orange-400">
                No billing account found. Subscribe to a plan to access billing management.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
        >
          <Crown className="w-5 h-5" />
          {user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
            ? 'Change Plan'
            : 'Upgrade Plan'}
        </Link>

        {user.stripeCustomerId ? (
          <button
            onClick={handleOpenBillingPortal}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Manage Billing
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center px-6 py-4 bg-white/5 border border-white/10 text-gray-500 rounded-xl">
            <span className="text-sm">Subscribe to manage billing</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            • Manage your payment methods, view invoices, and update billing information through
            the Stripe billing portal.
          </p>
          <p>
            • Your subscription will automatically renew unless canceled before the renewal date.
          </p>
          <p>
            • All payments are securely processed through Stripe. We never store your payment
            information.
          </p>
        </div>
      </div>
    </div>
  );
}

