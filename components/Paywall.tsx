'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, Check, ArrowRight, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface PaywallProps {
  status: 'expired' | 'past_due' | 'canceled' | 'inactive' | 'needs_subscription';
  message?: string;
}

export default function Paywall({ status, message }: PaywallProps) {
  const isNewUser = status === 'needs_subscription' || status === 'inactive';
  const isPastDue = status === 'past_due';

  const getTitle = () => {
    if (isNewUser) return 'Start Your Free Trial';
    switch (status) {
      case 'expired':
        return 'Your Trial Has Ended';
      case 'past_due':
        return 'Payment Issue';
      case 'canceled':
        return 'Subscription Ended';
      default:
        return 'Subscribe to Continue';
    }
  };

  const getDescription = () => {
    if (message) return message;
    if (isNewUser) return 'Add your payment method to start a 7-day free trial. Cancel anytime before the trial ends and you won\'t be charged.';
    switch (status) {
      case 'expired':
        return 'Your trial period has ended. Subscribe now to continue your Quran learning journey.';
      case 'past_due':
        return 'We couldn\'t process your payment. Please update your payment method to continue.';
      case 'canceled':
        return 'Your subscription has ended. Resubscribe to regain access to all features.';
      default:
        return 'Subscribe to unlock unlimited access to all puzzles, translations, and features.';
    }
  };

  const features = [
    'Unlimited puzzles across all 30 Juzs',
    '114 Surahs with word-by-word learning',
    '18+ translations in multiple languages',
    'Audio recitations by renowned Qaris',
    'Progress tracking & streaks',
    'Offline access (coming soon)',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Card */}
        <div className="bg-gradient-to-b from-[#151515] to-[#0f0f0f] border border-white/10 rounded-3xl p-8 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPastDue 
              ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20'
              : isNewUser 
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
          }`}>
            {isPastDue ? (
              <AlertCircle className="w-10 h-10 text-red-500" />
            ) : isNewUser ? (
              <CreditCard className="w-10 h-10 text-green-500" />
            ) : (
              <Lock className="w-10 h-10 text-yellow-500" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {getTitle()}
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-8">
            {getDescription()}
          </p>

          {/* New User - Show trial info */}
          {isNewUser && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-400 font-medium mb-2">
                <Sparkles className="w-5 h-5" />
                7-Day Free Trial
              </div>
              <p className="text-sm text-gray-400">
                Try everything free for 7 days. Your card will only be charged after the trial ends.
              </p>
            </div>
          )}

          {/* Features */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-white">What you'll get</span>
            </div>
            <ul className="space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">$5.99</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
              <div className="text-gray-600">or</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">$47.99</div>
                <div className="text-sm text-gray-500">per year</div>
                <div className="text-xs text-green-500 font-medium">Save 33%</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link href="/pricing">
            <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg gap-2">
              {isNewUser ? 'Start Free Trial' : isPastDue ? 'Update Payment' : 'View Plans'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          {/* Help link */}
          {isPastDue && (
            <Link 
              href="mailto:support@ayatbits.com"
              className="block mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Need help? Contact support
            </Link>
          )}

          {isNewUser && (
            <p className="mt-4 text-xs text-gray-600">
              Cancel anytime. No questions asked.
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Questions? Email us at{' '}
          <a href="mailto:support@ayatbits.com" className="text-green-500 hover:underline">
            support@ayatbits.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
