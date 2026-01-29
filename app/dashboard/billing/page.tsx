import { requireDashboardAccess } from '@/lib/dashboard-access';
import BillingContent from './BillingContent';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TutorialWrapper } from '@/components/tutorial';
import { billingTutorialSteps } from '@/lib/tutorial-configs';

export default async function BillingPage() {
  const user = await requireDashboardAccess();

  return (
    <TutorialWrapper
      sectionId="billing_overview"
      steps={billingTutorialSteps}
      delay={800}
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard/profile"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Billing & Subscription</h1>
              <p className="text-xs text-gray-500">Manage your subscription</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <BillingContent 
          user={{
            role: user.role,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
            stripeCustomerId: user.stripeCustomerId,
          }}
        />
      </div>
    </div>
    </TutorialWrapper>
  );
}

