'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2, CreditCard, Shield, Clock, ArrowRight, Gift, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function PricingContent() {
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
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('[PricingContent] Error checking access:', error);
        setHasAccess(false);
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
        setVoucherError(data.error || 'Invalid voucher code');
      }
    } catch (error) {
      setVoucherError('Failed to validate voucher');
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
        alert(`🎉 Voucher redeemed! You now have ${data.granted.tier} access for ${data.granted.duration} month(s).`);
        
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
        alert(data.error || 'Failed to redeem voucher');
        setRedeemingVoucher(false);
      }
    } catch (error) {
      console.error('[PricingContent] Redemption error:', error);
      alert('Failed to redeem voucher');
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
        alert('You already have access to AyatBits!');
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
        alert(data.error || 'You already have access!');
        window.location.href = data.redirect;
      } else {
        console.error('[PricingContent] No URL or redirect in response');
        setLoadingPlan(null);
        alert(data.error || 'Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('[PricingContent] Checkout error:', error);
      setLoadingPlan(null);
      alert('An error occurred. Please try again.');
    }
  };

  const basicFeatures = [
    'All 30 Juzs & 114 Surahs',
    'Unlimited puzzles',
    '18+ translations',
    'Progress tracking & streaks',
    'Audio recitations',
    'Transliterations',
    'Offline mode (coming soon)',
  ];

  const proFeatures = [
    ...basicFeatures,
    '✨ AI Tafsir (Ibn Kathir translations)',
    '✨ Word-by-word audio recitation',
    'Priority support',
    'Early access to new features',
  ];

  const plans = [
    {
      tier: 'basic' as const,
      name: 'Basic Monthly',
      price: '€5.99',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly',
      features: basicFeatures,
    },
    {
      tier: 'basic' as const,
      name: 'Basic Yearly',
      price: '€49.99',
      period: '/year',
      originalPrice: '€71.88',
      savings: 'Save 30%',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly',
      features: basicFeatures,
      popular: false,
    },
    {
      tier: 'pro' as const,
      name: 'Pro Monthly',
      price: '€11.99',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
      features: proFeatures,
    },
    {
      tier: 'pro' as const,
      name: 'Pro Yearly',
      price: '€99.99',
      period: '/year',
      originalPrice: '€143.88',
      savings: 'Save 35%',
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
                {reason === 'subscription_required' ? 'Subscription required to continue' : 'Choose your plan'}
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
                <h3 className="text-lg font-semibold text-blue-400">Processing your payment...</h3>
              </div>
              <p className="text-gray-300 mb-2">Payment successful! Setting up your account...</p>
              <p className="text-sm text-gray-400">This usually takes 5-10 seconds</p>
            </motion.div>
          )}

          {/* Access Granted Banner */}
          {hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-green-400">You already have access!</h3>
              </div>
              <p className="text-gray-300 mb-4">Redirecting you to the dashboard...</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-gray-400 text-lg">
              Start with a 7-day free trial. Cancel anytime.
            </p>
          </motion.div>

          {/* Voucher Input */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-white">Have a voucher code?</h3>
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
                  placeholder="Enter code (e.g., RAMADAN2026)"
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
                      Redeem
                    </button>
                  </SignedIn>
                ) : (
                  <button
                    onClick={() => validateVoucher(voucherCode)}
                    disabled={validatingVoucher || !voucherCode.trim()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-lg font-medium transition-colors"
                  >
                    {validatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
                  </button>
                )}
              </div>
              {validatingVoucher && <p className="text-sm text-gray-400 mt-2">Validating...</p>}
              {voucherError && <p className="text-sm text-red-400 mt-2">{voucherError}</p>}
              {voucherData && (
                <>
                  <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300">
                      ✨ Valid! {voucherData.tier.toUpperCase()} tier for {voucherData.duration} month(s)
                      {voucherData.description && ` - ${voucherData.description}`}
                    </p>
                  </div>
                  <SignedOut>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-300 mb-2">
                        👉 Please sign in to redeem this voucher
                      </p>
                      <SignUpButton mode="modal">
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                          Sign In / Sign Up
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
                Basic
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
                Pro
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
                      Best Value
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
                  <p className="text-xs text-gray-500 mt-2">7-day free trial included</p>
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
                        Start Free Trial
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
                          Go to Dashboard
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
                            Checking...
                          </>
                        ) : loadingPlan === plan.priceId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Start Free Trial
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
              7-day free trial • Cancel anytime • Secure payment via Stripe
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

