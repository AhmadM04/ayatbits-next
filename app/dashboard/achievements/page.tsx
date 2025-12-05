import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { I18nProvider } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-server';
import { DEFAULT_LOCALE } from '@/lib/i18n-config';
import AchievementsContent from './AchievementsContent';

export default async function AchievementsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check dashboard access (redirects if no access, except admin bypass)
  await requireDashboardAccess(user.id);

  // Load messages on server side
  const messages = await getMessages(DEFAULT_LOCALE);

  return (
    <I18nProvider locale={DEFAULT_LOCALE} messages={messages}>
      <AchievementsContent />
    </I18nProvider>
  );
}
