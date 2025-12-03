import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';
import { UserButton } from '@clerk/nextjs';
import { ArrowLeft, Mail, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * Simple profile page - accessible without subscription
 * Shows only email and basic info, no progress or dashboard stuff
 */
export default async function ProfilePage() {
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
      // New user - create without subscription
      dbUser = await User.create({
        clerkId: user.id,
        email: userEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
        subscriptionStatus: 'inactive',
      });
    }
  }

  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.emailAddresses[0]?.emailAddress || 'User';
  
  const userEmailDisplay = user.emailAddresses[0]?.emailAddress || '';
  const userInitial = user.firstName?.[0] || userEmailDisplay[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Profile</span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            {user.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={userName}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold">
                {userInitial}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              <p className="text-gray-400 text-sm">Your profile</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-white">{userEmailDisplay}</p>
              </div>
            </div>

            {/* Name */}
            {(user.firstName || user.lastName) && (
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-white">{userName}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA to start trial */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-sm text-gray-400 mb-4 text-center">
              Ready to start learning?
            </p>
            <Link href="/pricing?trial=true">
              <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300">
                Start Your 7-Day Free Trial
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

