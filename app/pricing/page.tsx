import { currentUser } from '@clerk/nextjs/server';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function PricingPage() {
  const user = await currentUser();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Access to basic puzzles',
        'Limited Juz selection',
        'Progress tracking',
        'Community support',
      ],
      cta: user ? 'Current Plan' : 'Get Started',
      href: user ? '/dashboard' : '/sign-up',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited puzzles',
        'All 30 Juzs',
        'All 114 Surahs',
        'Advanced progress tracking',
        'Priority support',
        'Ad-free experience',
      ],
      cta: 'Upgrade to Pro',
      href: user ? '/api/checkout' : '/sign-up',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Start your journey of memorizing the Quran today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period !== 'forever' && (
                  <span className="text-gray-600">/{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="block">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

