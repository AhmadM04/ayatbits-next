import { requireDashboardAccess } from '@/lib/dashboard-access';
import { TutorialWrapper } from '@/components/tutorial';
import { billingTutorialSteps } from '@/lib/tutorial-configs';
import { I18nProvider } from '@/lib/i18n';
import BillingPageClient from './BillingPageClient';

export default async function BillingPage() {
  const user = await requireDashboardAccess();

  return (
    <I18nProvider>
      <TutorialWrapper
        sectionId="billing_overview"
        steps={billingTutorialSteps}
        delay={800}
      >
        <BillingPageClient
          user={{
            role: user.role,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
            stripeCustomerId: user.stripeCustomerId,
            hasDirectAccess: user.hasDirectAccess,
          }}
        />
      </TutorialWrapper>
    </I18nProvider>
  );
}

