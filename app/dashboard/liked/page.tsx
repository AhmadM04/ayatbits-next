import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { I18nProvider } from '@/lib/i18n';
import LikedAyahsContent from './LikedAyahsContent';

export default async function LikedAyahsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check dashboard access (redirects if no access, except admin bypass)
  await requireDashboardAccess(user.id);

  return (
    <I18nProvider>
      <LikedAyahsContent />
    </I18nProvider>
  );
}
