'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2, CreditCard, Shield, Clock, ArrowRight, Gift, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function PricingContent() {
  const { t } = useI18n();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro'>('pro'); // Default to pro
  const [voucherCode, setVoucherCode] = useState('');
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [redeemingVoucher, setRedeemingVoucher] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    plan: string;
    tier: string;
    daysUntilExpiry?: number | null;
  } | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    // Check for voucher in URL
    const urlVoucher = searchParams.get('voucher');
    
    if (urlVoucher) {
      setVoucherCode(urlVoucher);
      validateVoucher(urlVoucher);
    }
  }, []);
  
  const isTrialFlow = mounted ? searchParams.get('trial') === 'true' : false;
  const reason = mounted ? searchParams.get('reason') : null;
  const isProcessingPayment = mounted ? searchParams.get('success') === 'true' : false;

  // Check access
  useEffect(() => {
    if (!mounted) return;
    
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/check-access', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await response.json();
        
        if (data.hasAccess) {
          setHasAccess(true);
          setSubscriptionDetails({
            plan: data.plan,
            tier: data.tier,
            daysUntilExpiry: data.daysUntilExpiry,
          });
          // Don't auto-redirect - let user see they have access
        } else {
          setHasAccess(false);
          setSubscriptionDetails(null);
        }
      } catch (error) {
        console.error('[PricingContent] Error checking access:', error);
        setHasAccess(false);
        setSubscriptionDetails(null);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
    const pollInterval = setInterval(() => {
      if (!hasAccess) {
        checkAccess();
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [mounted, hasAccess, router]);

  // Validate voucher
  const validateVoucher = async (code: string) => {
    if (!code.trim()) {
      setVoucherError('');
      setVoucherData(null);
      return;
    }

    setValidatingVoucher(true);
    setVoucherError('');
    setVoucherData(null);

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setVoucherData(data.voucher);
        setSelectedTier(data.voucher.tier);
      } else {
        setVoucherError(data.error || t('pricing.invalidVoucher'));
      }
    } catch (error) {
      setVoucherError(t('pricing.voucherValidationFailed'));
    } finally {
      setValidatingVoucher(false);
    }
  };

  // Redeem voucher
  const redeemVoucher = async () => {
    if (!voucherData) return;

    setRedeemingVoucher(true);

    try {
      const response = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode }),
      });

      const data = await response.json();

      if (data.success) {
        alert(t('pricing.voucherRedeemed', { tier: data.granted.tier, duration: data.granted.duration }));
        
        // Force re-check access immediately with cache busting
        setCheckingAccess(true);
        setHasAccess(null); // Reset to trigger re-check
        
        // Wait a moment for DB to propagate, then check access
        setTimeout(async () => {
          try {
            const accessResponse = await fetch('/api/check-access', {
              cache: 'no-store',
              headers: { 
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
            });
            const accessData = await accessResponse.json();
            
            if (accessData.hasAccess) {
              setHasAccess(true);
              setTimeout(() => router.push('/dashboard'), 500);
            } else {
              // If still no access, keep polling
              setHasAccess(false);
              setCheckingAccess(false);
            }
          } catch (error) {
            console.error('[PricingContent] Error checking access after redemption:', error);
            setHasAccess(false);
            setCheckingAccess(false);
          }
        }, 500);
      } else {
        console.error('[PricingContent] Redemption failed:', data.error);
        alert(data.error || t('pricing.voucherRedemptionFailed'));
        setRedeemingVoucher(false);
      }
    } catch (error) {
      console.error('[PricingContent] Redemption error:', error);
      alert(t('pricing.voucherRedemptionFailed'));
      setRedeemingVoucher(false);
    }
  };

  // Handle subscription
  const handleSubscribe = async (priceId: string, tier: 'basic' | 'pro') => {
    setLoadingPlan(priceId);
    
    try {
      const accessCheck = await fetch('/api/check-access', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const accessData = await accessCheck.json();
      
      if (accessData.hasAccess) {
        alert(t('pricing.alreadyHaveAccessAlert'));
        window.location.href = '/dashboard';
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.redirect) {
        alert(data.error || t('pricing.alreadyHaveAccess'));
        window.location.href = data.redirect;
      } else {
        console.error('[PricingContent] No URL or redirect in response');
        setLoadingPlan(null);
        alert(data.error || t('pricing.checkoutFailed'));
      }
    } catch (error) {
      console.error('[PricingContent] Checkout error:', error);
      setLoadingPlan(null);
      alert(t('pricing.errorOccurred'));
    }
  };

  const basicFeatures = [
    t('pricing.feature1'),
    t('pricing.feature2'),
    t('pricing.feature3'),
    t('pricing.feature4'),
    t('pricing.feature5'),
    t('pricing.feature6'),
    t('pricing.feature10'),
  ];

  const proFeatures = [
    ...basicFeatures,
    t('pricing.feature7'),
    t('pricing.feature8'),
    t('pricing.feature9'),
    t('pricing.feature11'),
  ];

  const plans = [
    {
      tier: 'basic' as const,
      name: t('pricing.basicMonthly'),
      price: '€5.99',
      period: t('pricing.perMonth'),
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly',
      features: basicFeatures,
    },
    {
      tier: 'basic' as const,
      name: t('pricing.basicYearly'),
      price: '€49.99',
      period: t('pricing.perYear'),
      originalPrice: '€71.88',
      savings: t('landing.save30'),
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly',
      features: basicFeatures,
      popular: false,
    },
    {
      tier: 'pro' as const,
      name: t('pricing.proMonthly'),
      price: '€11.99',
      period: t('pricing.perMonth'),
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
      features: proFeatures,
    },
    {
      tier: 'pro' as const,
      name: t('pricing.proYearly'),
      price: '€99.99',
      period: t('pricing.perYear'),
      originalPrice: '€143.88',
      savings: t('landing.save35'),
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
      features: proFeatures,
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="fixed w-full top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/ayatbits-logo.svg"
                alt="AyatBits"
                width={180}
                height={48}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <SignedIn>
              <span className="text-sm text-gray-400 hidden sm:inline">
                {reason === 'subscription_required' ? t('pricing.subscriptionRequired') : t('pricing.chooseYourPlanSmall')}
              </span>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Processing Payment Banner */}
          {isProcessingPayment && !hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <h3 className="text-lg font-semibold text-blue-400">{t('pricing.processingPayment')}</h3>
              </div>
              <p className="text-gray-300 mb-2">{t('pricing.paymentSuccessful')}</p>
              <p className="text-sm text-gray-400">{t('pricing.takesSeconds')}</p>
            </motion.div>
          )}

          {/* Access Granted Banner */}
          {hasAccess && subscriptionDetails && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-green-400">{t('pricing.youHaveAccess')}</h3>
              </div>
              <p className="text-gray-300 mb-2">
                {subscriptionDetails.plan === 'lifetime' && 'You have Lifetime access'}
                {subscriptionDetails.plan === 'monthly' && 'You have a Monthly subscription'}
                {subscriptionDetails.plan === 'yearly' && 'You have a Yearly subscription'}
                {subscriptionDetails.plan === 'trial' && `You have a Trial (${subscriptionDetails.daysUntilExpiry || 7} days remaining)`}
                {subscriptionDetails.plan === 'granted' && subscriptionDetails.daysUntilExpiry && 
                  `You have temporary access (${subscriptionDetails.daysUntilExpiry} days remaining)`}
                {subscriptionDetails.plan === 'granted' && !subscriptionDetails.daysUntilExpiry && 
                  'You have admin-granted access'}
                {subscriptionDetails.plan === 'admin' && 'You have Admin access'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                No need to subscribe - you already have access to the platform.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors">
                {t('pricing.goToDashboard')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {t('pricing.title')}
            </h1>
            <p className="text-gray-400 text-lg">
              {t('pricing.subtitle')}
            </p>
          </motion.div>

          {/* Voucher Input */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-white">{t('pricing.haveVoucher')}</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  onBlur={() => validateVoucher(voucherCode)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      validateVoucher(voucherCode);
                    }
                  }}
                  placeholder={t('pricing.enterCode')}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                {voucherData ? (
                  <SignedIn>
                    <button
                      onClick={redeemVoucher}
                      disabled={redeemingVoucher}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {redeemingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                      {t('pricing.redeem')}
                    </button>
                  </SignedIn>
                ) : (
                  <button
                    onClick={() => validateVoucher(voucherCode)}
                    disabled={validatingVoucher || !voucherCode.trim()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-lg font-medium transition-colors"
                  >
                    {validatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : t('pricing.validate')}
                  </button>
                )}
              </div>
              {validatingVoucher && <p className="text-sm text-gray-400 mt-2">{t('pricing.validating')}</p>}
              {voucherError && <p className="text-sm text-red-400 mt-2">{voucherError}</p>}
              {voucherData && (
                <>
                  <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300">
                      {t('pricing.voucherValid', { tier: voucherData.tier.toUpperCase(), duration: voucherData.duration })}
                      {voucherData.description && ` - ${voucherData.description}`}
                    </p>
                  </div>
                  <SignedOut>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-300 mb-2">
                        {t('pricing.signInToRedeem')}
                      </p>
                      <SignUpButton mode="modal">
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                          {t('pricing.signInSignUp')}
                        </button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                </>
              )}
            </div>
          </motion.div>

          {/* Tier Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setSelectedTier('basic')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedTier === 'basic'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('pricing.basic')}
              </button>
              <button
                onClick={() => setSelectedTier('pro')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedTier === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                {t('pricing.pro')}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans
              .filter(plan => plan.tier === selectedTier)
              .map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-purple-600/20 to-transparent border-2 border-purple-500/50' 
                    : 'bg-white/[0.02] border border-white/[0.05]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 rounded-full text-xs font-semibold">
                      <Star className="w-3 h-3" />
                      {t('pricing.bestValue')}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-400 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gray-500 line-through text-sm">{plan.originalPrice}</span>
                      <span className="text-green-400 text-sm font-medium">{plan.savings}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{t('pricing.trialIncluded')}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <SignedOut>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className={`group relative w-full h-12 rounded-xl font-semibold overflow-hidden transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {t('pricing.startFreeTrial')}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  {hasAccess ? (
                    <Link href="/dashboard">
                      <button className="w-full h-12 rounded-xl font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
                        <span className="flex items-center justify-center gap-2">
                          {t('pricing.goToDashboard')}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.priceId, plan.tier)}
                      disabled={loadingPlan !== null || checkingAccess}
                      className={`group relative w-full h-12 rounded-xl font-semibold overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {checkingAccess ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('pricing.checking')}
                          </>
                        ) : loadingPlan === plan.priceId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('pricing.processing')}
                          </>
                        ) : (
                          <>
                            {t('pricing.startFreeTrial')}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </button>
                  )}
                </SignedIn>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              {t('pricing.securePayment')}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

