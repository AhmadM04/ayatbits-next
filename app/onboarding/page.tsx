import { redirect } from 'next/navigation';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { checkSubscription } from '@/lib/subscription';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  // ========================================================================
  // LOOP BREAKER FIX: Allow all authenticated users to onboard
  // ========================================================================
  // Free tier users should complete onboarding too - don't block them
  // They'll see upgrade prompts in the dashboard for premium features
  // ========================================================================
  
  let user;
  try {
    user = await requireDashboardAccess();
  } catch (error) {
    // Only redirect to sign-in if not authenticated at all
    redirect('/sign-in');
  }

  // Check if user has already completed onboarding
  if (user.onboardingCompleted) {
    redirect('/dashboard');
  }

  // Allow all authenticated users to complete onboarding (Free tier included)
  // No subscription check needed here

  return (
    <OnboardingClient
      userFirstName={user.firstName || ''}
      currentTranslation={user.selectedTranslation || 'en.sahih'}
      currentLocale={user.preferredLanguage || 'en'}
    />
  );
}

