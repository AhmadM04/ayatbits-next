import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';
import DashboardI18nProvider from './DashboardI18nProvider';
import { checkSubscriptionAccess } from '@/lib/subscription';

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
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  let dbUser = await User.findOne({ clerkId: user.id });
  
  if (!dbUser) {
    // Check if user exists by email (created by admin before they signed in)
    dbUser = await User.findOne({ email: userEmail });
    
    if (dbUser) {
      // User was created by admin - update with Clerk ID and info
      dbUser = await User.findOneAndUpdate(
        { email: userEmail },
        {
          clerkId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.fullName,
          imageUrl: user.imageUrl,
        },
        { new: true }
      );
    } else {
      // New user - create without subscription (needs to add payment first)
      dbUser = await User.create({
        clerkId: user.id,
        email: userEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
        subscriptionStatus: 'inactive', // Must subscribe to access
      });
    }
  }

  // Check subscription access
  const access = checkSubscriptionAccess(dbUser);

  // If no access, redirect to pricing page to start trial
  if (!access.hasAccess) {
    redirect('/pricing?trial=true');
  }

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  return (
    <DashboardI18nProvider translationCode={selectedTranslation}>
      {children}
    </DashboardI18nProvider>
  );
}
