'use client';

import { useState } from 'react';
import { Check, Sparkles, Loader2, CreditCard, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isTrialFlow = searchParams.get('trial') === 'true';

  const plans = [
    {
      name: 'Monthly',
      price: '$5.99',
      period: '/month',
      priceId: 'monthly',
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
      price: '$47.99',
      period: '/year',
      priceId: 'yearly',
      originalPrice: '$71.88',
      savings: 'Save 33%',
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
        body: JSON.stringify({ plan: priceId }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-green-500">
              AyatBits
            </Link>
            <SignedIn>
              <span className="text-sm text-gray-400">
                Almost there! Choose your plan below.
              </span>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {isTrialFlow ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-sm font-medium">Welcome to AyatBits!</span>
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
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing</h1>
                <p className="text-gray-400 text-lg">
                  Start with a 7-day free trial. Cancel anytime.
                </p>
              </>
            )}
          </motion.div>

          {/* Trial Info Banner */}
          {isTrialFlow && (
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
                    <Button
                      className={`w-full h-12 rounded-xl font-semibold ${
                        plan.popular
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button
                    onClick={() => handleSubscribe(plan.priceId)}
                    disabled={loadingPlan !== null}
                    className={`w-full h-12 rounded-xl font-semibold ${
                      plan.popular
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {loadingPlan === plan.priceId ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
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
                Contact us at support@ayatbits.com
              </p>
              <Link href="/">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-white/5 rounded-full">
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}




