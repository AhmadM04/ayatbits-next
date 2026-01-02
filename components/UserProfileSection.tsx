'use client';

import { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';

export default function UserProfileSection() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      // Add a small delay to ensure Clerk session is fully established
      const checkAccess = async () => {
        try {
          const res = await fetch('/api/check-access', {
            credentials: 'include', // Ensure cookies are sent
          });
          
          if (res.ok) {
            const data = await res.json();
            setHasAccess(data.hasAccess);
          } else if (res.status === 401) {
            // Session not ready yet, retry after a short delay
            setTimeout(() => {
              fetch('/api/check-access', { credentials: 'include' })
                .then(res => res.ok ? res.json() : { hasAccess: false })
                .then(data => setHasAccess(data.hasAccess))
                .catch(() => setHasAccess(false));
            }, 1000);
          } else {
            setHasAccess(false);
          }
        } catch (error) {
          console.error('Error checking access:', error);
          setHasAccess(false);
        }
      };

      // Small delay to ensure Clerk session is ready
      const timeoutId = setTimeout(checkAccess, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isSignedIn, isLoaded]);
  
  if (!user) return null;

  const buttonText = hasAccess === null ? 'Dashboard' : (hasAccess ? 'Dashboard' : 'Start Learning');
  const buttonLink = hasAccess === null ? '/dashboard' : (hasAccess ? '/dashboard' : '/pricing');

  const userInitial = user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0].toUpperCase() || 'U';

  return (
    <>
      {/* Mobile: Small icon button that opens modal */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 border-2 border-white/20"
      >
        <span className="text-white font-semibold text-sm">
          {userInitial}
        </span>
      </button>

      {/* Desktop: Full profile section */}
      <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {userInitial}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user.emailAddresses[0]?.emailAddress}
          </div>
        </div>
        <Link href={buttonLink}>
          <Button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2">
            {buttonText}
          </Button>
        </Link>
        <SignOutButton>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </SignOutButton>
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:hidden"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Profile</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {userInitial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-medium text-white truncate">
                      {user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {user.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href={buttonLink} onClick={() => setShowModal(false)}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      {buttonText}
                    </Button>
                  </Link>
                  <SignOutButton>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
