import { redirect } from 'next/navigation';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { checkSubscription } from '@/lib/subscription';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  // Check if user has access
  let user;
  try {
    user = await requireDashboardAccess();
  } catch (error) {
    // User doesn't have access, redirect to pricing
    redirect('/pricing');
  }

  // Check if user has already completed onboarding
  if (user.onboardingCompleted) {
    redirect('/dashboard');
  }

  // Check if user has subscription access
  const hasAccess = checkSubscription(user);
  if (!hasAccess) {
    redirect('/pricing');
  }

  return (
    <OnboardingClient
      userFirstName={user.firstName || ''}
      currentTranslation={user.selectedTranslation || 'en.sahih'}
      currentLocale={user.preferredLanguage || 'en'}
    />
  );
}

