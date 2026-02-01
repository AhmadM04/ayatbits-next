'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, User, Mail, LayoutDashboard } from 'lucide-react';

export default function UserProfileSection() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);
  
  if (!user) return null;

  const buttonText = hasAccess === null ? 'Dashboard' : (hasAccess ? 'Dashboard' : 'Start Learning');
  const buttonLink = hasAccess === null ? '/dashboard' : (hasAccess ? '/dashboard' : '/pricing');

  const userInitial = user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0].toUpperCase() || 'U';

  return (
    <>
      {/* Compact profile section */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <button 
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-green-500/50 transition-all cursor-pointer"
        >
          <span className="text-white font-semibold text-xs">
            {userInitial}
          </span>
        </button>
        <SignOutButton>
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </SignOutButton>
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <div 
          ref={modalRef}
          className="absolute right-4 top-16 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/10 p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {userInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user.firstName || 'User'}
                </div>
                <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.emailAddresses[0]?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link 
              href={buttonLink}
              onClick={() => setIsModalOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{buttonText}</div>
                <div className="text-xs text-gray-500">View your progress</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
