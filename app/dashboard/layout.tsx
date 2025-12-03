import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';
import DashboardI18nProvider from './DashboardI18nProvider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  await connectDB();

  // Find or create user
  let dbUser = await User.findOne({ clerkId: user.id });
  if (!dbUser) {
    dbUser = await User.create({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.fullName,
      imageUrl: user.imageUrl,
    });
  }

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  return (
    <DashboardI18nProvider translationCode={selectedTranslation}>
      {children}
    </DashboardI18nProvider>
  );
}

