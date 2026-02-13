'use client';

import { useState } from 'react';
import { CreditCard, ExternalLink, Loader2, CheckCircle2, XCircle, Calendar, Crown, Gift, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface BillingContentProps {
  user: {
    role?: 'admin' | 'user';
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    subscriptionEndDate?: string;
    stripeCustomerId?: string;
    hasDirectAccess?: boolean;
  };
}

export default function BillingContent({ user }: BillingContentProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

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
        showToast(data.error || t('billing.failedToOpenPortal'), 'error');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      showToast(t('billing.failedToOpenPortal'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (user.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3728] mb-2">{t('billing.title')}</h1>
          <p className="text-[#8E7F71]">{t('billing.manageInfo')}</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4A3728]">{t('billing.adminAccount')}</h3>
              <p className="text-sm text-[#8E7F71]">{t('billing.adminFullAccess')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate days until expiry for admin-granted access
  const getDaysUntilExpiry = () => {
    if (!user.subscriptionEndDate) return null;
    const now = new Date();
    const expiry = new Date(user.subscriptionEndDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isLifetimeGrant = user.hasDirectAccess && user.subscriptionPlan === 'lifetime';
  const isTemporaryGrant = user.hasDirectAccess && !isLifetimeGrant;
  const isExpiringSoon = isTemporaryGrant && daysUntilExpiry !== null && daysUntilExpiry <= 30;
  const hasBothGrantAndStripe = user.hasDirectAccess && user.stripeCustomerId;

  const getStatusBadge = () => {
    // Admin-granted lifetime access
    if (isLifetimeGrant) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 text-blue-600 border border-blue-200">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">{t('billing.lifetimeAccess')}</span>
        </div>
      );
    }

    // Temporary grant expiring soon
    if (isExpiringSoon) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50/50 text-orange-600 border border-orange-200">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{t('billing.expiringSoon')}</span>
        </div>
      );
    }

    // Temporary grant with time remaining
    if (isTemporaryGrant) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 text-blue-600 border border-blue-200">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">{t('billing.adminGranted')}</span>
        </div>
      );
    }

    // Regular subscription statuses
    const status = user.subscriptionStatus || 'trial';
    const plan = user.subscriptionPlan || 'trial';

    if (status === 'active' || status === 'trialing') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/50 text-[#059669] border border-[#059669]/30">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{plan}</span>
        </div>
      );
    } else if (status === 'past_due' || status === 'unpaid') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50/50 text-red-600 border border-red-200">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{t('billing.paymentRequired')}</span>
        </div>
      );
    } else if (status === 'canceled') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-[#8E7F71] border border-[#E5E7EB]">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{t('billing.canceled')}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50/50 text-orange-600 border border-orange-200">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{t('billing.trial')}</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#4A3728] mb-2">{t('billing.title')}</h1>
        <p className="text-[#8E7F71]">{t('billing.manageInfo')}</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm" data-tutorial="subscription-status">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4A3728]">{t('billing.currentPlan')}</h3>
              <p className="text-sm text-[#8E7F71]">{t('billing.activeSubscription')}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-4">
          {/* Grant-specific messaging */}
          {isLifetimeGrant && (
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700 mb-2 font-medium">
                {t('billing.lifetimeGranted')}
              </p>
              <p className="text-sm text-[#8E7F71]">
                {t('billing.lifetimeGrantedDesc')}
              </p>
            </div>
          )}

          {isExpiringSoon && daysUntilExpiry !== null && (
            <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl">
              <p className="text-sm text-orange-700 mb-2 font-medium">
                {daysUntilExpiry === 1 
                  ? t('billing.accessExpires', { days: daysUntilExpiry })
                  : t('billing.accessExpiresDays', { days: daysUntilExpiry })}
              </p>
              <p className="text-sm text-[#8E7F71]">
                {t('billing.subscribeNowDesc')}
              </p>
            </div>
          )}

          {isTemporaryGrant && !isExpiringSoon && daysUntilExpiry !== null && (
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700 mb-2 font-medium">
                {t('billing.adminGrantedAccess')}
              </p>
              <p className="text-sm text-[#8E7F71]">
                {t('billing.validUntil', { 
                  date: new Date(user.subscriptionEndDate!).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                })}
              </p>
            </div>
          )}

          {hasBothGrantAndStripe && (
            <div className="p-4 bg-emerald-50/50 border border-[#059669]/30 rounded-xl">
              <p className="text-sm text-emerald-700 mb-2 font-medium">
                {t('billing.bothAccessAndSub')}
              </p>
              <p className="text-sm text-[#8E7F71]">
                {t('billing.thankYouSupport')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#8E7F71] mb-1">{t('billing.planType')}</p>
              <p className="text-lg font-medium text-[#4A3728] capitalize">
                {user.subscriptionPlan || t('billing.trial')}
                {user.hasDirectAccess && ` ${t('billing.adminLabel')}`}
              </p>
            </div>
            {user.subscriptionEndDate && (
              <div className="p-4 bg-gray-50 rounded-xl border border-[#E5E7EB]">
                <p className="text-sm text-[#8E7F71] mb-1">
                  {user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
                    ? user.stripeCustomerId ? t('billing.renewsOn') : t('billing.expiresOn')
                    : t('billing.expiresOn')}
                </p>
                <p className="text-lg font-medium text-[#4A3728]">
                  {new Date(user.subscriptionEndDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {!user.stripeCustomerId && !user.hasDirectAccess && (
            <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl">
              <p className="text-sm text-orange-600">
                {t('billing.noBillingAccount')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tutorial="plan-options">
        <Link
          href="/pricing"
          className={`flex items-center justify-center gap-2 px-6 py-4 text-white rounded-xl font-medium transition-colors ${
            isExpiringSoon 
              ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
              : isLifetimeGrant 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-[#059669] hover:bg-emerald-700'
          }`}
        >
          <Crown className="w-5 h-5" />
          {isLifetimeGrant 
            ? t('billing.supportUs')
            : isExpiringSoon 
            ? t('billing.subscribeNow')
            : user.stripeCustomerId 
            ? t('billing.changePlan')
            : t('billing.subscribe')}
        </Link>

        {user.stripeCustomerId ? (
          <button
            onClick={handleOpenBillingPortal}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 border border-[#E5E7EB] text-[#4A3728] rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-tutorial="manage-subscription"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('billing.opening')}
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                {t('billing.manageBilling')}
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center px-6 py-4 bg-gray-100 border border-[#E5E7EB] text-[#8E7F71] rounded-xl">
            <span className="text-sm">
              {user.hasDirectAccess ? t('billing.noStripeYet') : t('billing.subscribeToManage')}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#4A3728] mb-4">{t('billing.billingInformation')}</h3>
        <div className="space-y-3 text-sm text-[#8E7F71]">
          <p>
            {t('billing.info1')}
          </p>
          <p>
            {t('billing.info2')}
          </p>
          <p>
            {t('billing.info3')}
          </p>
        </div>
      </div>
    </div>
  );
}

