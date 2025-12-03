'use client';

import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const plans = [
    {
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      features: [
        'Unlimited puzzles',
        'All 30 Juzs & 114 Surahs',
        '18+ translations',
        'Progress tracking & streaks',
        'Audio recitations',
        'Priority support',
      ],
      cta: 'Start 7-Day Trial',
      popular: false,
    },
    {
      name: 'Yearly',
      price: '$79.99',
      period: '/year',
      originalPrice: '$119.88',
      savings: 'Save 33%',
      features: [
        'Everything in Monthly',
        'Offline mode (coming soon)',
        'Early access to new features',
        'Exclusive badge',
      ],
      cta: 'Start 7-Day Trial',
      popular: true,
    },
  ];

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
              <Link href="/dashboard">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  Dashboard
                </Button>
              </Link>
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing</h1>
            <p className="text-gray-400 text-lg">
              Start with a 7-day free trial. Cancel anytime.
            </p>
          </motion.div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
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
                  <Link href="/api/checkout">
                    <Button
                      className={`w-full h-12 rounded-xl font-semibold ${
                        plan.popular
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      Subscribe Now
                    </Button>
                  </Link>
                </SignedIn>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm">
              7-day free trial • Cancel anytime • Secure payment via Stripe
            </p>
          </motion.div>

          {/* FAQ teaser */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
        </div>
      </main>
    </div>
  );
}
