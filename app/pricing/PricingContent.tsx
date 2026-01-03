'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2, CreditCard, Shield, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isTrialFlow = searchParams.get('trial') === 'true';
  const reason = searchParams.get('reason');

  // Check if user already has access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/check-access');
        const data = await response.json();
        
        if (data.hasAccess) {
          setHasAccess(true);
          // Redirect users who already have access to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [router]);

  // Stripe Price IDs - these should match your Stripe dashboard
  const plans = [
    {
      name: 'Monthly',
      price: '$5.99',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
      features: [
        'Unlimited puzzles',
        'All 30 Juzs & 114 Surahs',
        '18+ translations',
        'Progress tracking & streaks',
        'Audio recitations',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Yearly',
      price: '$49.99',
      period: '/year',
      priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
      originalPrice: '$71.88',
      savings: 'Save 30%',
      features: [
        'Everything in Monthly',
        'Offline mode (coming soon)',
        'Early access to new features',
        'Exclusive badge',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    setLoadingPlan(priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.redirect) {
        // User already has access - redirect to dashboard
        alert(data.error || 'You already have access!');
        window.location.href = data.redirect;
      } else {
        console.error('No checkout URL returned:', data);
        setLoadingPlan(null);
        alert(data.error || 'Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingPlan(null);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image 
                src="/ayatbits-logo.svg" 
                alt="AyatBits" 
                width={150} 
                height={40}
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
        <div className="max-w-4xl mx-auto">
          {/* Already Has Access Alert */}
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
              <p className="text-gray-300 mb-4">
                Redirecting you to the dashboard...
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {isTrialFlow || reason === 'subscription_required' ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-sm font-medium">Start Your Journey</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Start your 7-day free trial
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  Add your payment method to unlock all features. You won't be charged until after your trial ends.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Simple pricing
                </h1>
                <p className="text-gray-400 text-lg">
                  Start with a 7-day free trial. Cancel anytime.
                </p>
              </>
            )}
          </motion.div>

          {/* Trial Info Banner */}
          {(isTrialFlow || reason === 'subscription_required') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">7 Days Free</p>
                      <p className="text-xs text-gray-500">Full access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Cancel Anytime</p>
                      <p className="text-xs text-gray-500">No commitment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Secure Payment</p>
                      <p className="text-xs text-gray-500">Powered by Stripe</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-green-600/20 to-transparent border-2 border-green-500/50' 
                    : 'bg-white/[0.02] border border-white/[0.05]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-600 rounded-full text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
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
                  <p className="text-xs text-gray-500 mt-2">
                    After 7-day free trial
                  </p>
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
                      className={`group relative w-full h-12 rounded-xl font-semibold overflow-hidden transition-all visible ${
                        plan.popular
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      style={{ display: 'block', visibility: 'visible' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] animate-shimmer" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  {hasAccess ? (
                    <Link href="/dashboard">
                      <button
                        type="button"
                        className="w-full h-12 rounded-xl font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Go to Dashboard
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </button>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={loadingPlan !== null || checkingAccess}
                      className={`group relative w-full h-12 rounded-xl font-semibold overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed visible ${
                        plan.popular
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      style={{ display: 'block', visibility: 'visible' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] animate-shimmer" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loadingPlan === plan.priceId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {plan.cta}
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

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm">
              7-day free trial • Cancel anytime • Secure payment via Stripe
            </p>
          </motion.div>

          {/* FAQ teaser */}
          {!isTrialFlow && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Questions?</h2>
              <p className="text-gray-400 mb-6">
                Contact us at hello@ayatbits.com
              </p>
              <Link href="/">
                <button className="px-6 py-3 border border-white/20 text-gray-300 hover:bg-white/5 rounded-full transition-colors">
                  Back to Home
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
