'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Trophy, Play, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResumeData {
  resumeUrl: string | null;
  surahName?: string;
  ayahNumber?: number;
}

// Default resume URL if user hasn't started yet
const DEFAULT_RESUME_URL = '/dashboard/juz/1/surah/1?ayah=1';

export default function BottomNav() {
  const pathname = usePathname();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Hide BottomNav on puzzle pages
  if (pathname?.startsWith('/puzzle/')) {
    return null;
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchResumeData = async () => {
    try {
      const res = await fetch('/api/user/resume');
      const data = await res.json();
      setResumeData(data);
    } catch (error) {
      console.error('Failed to fetch resume data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchResumeData();
    }
  }, [isMounted]);

  // Refresh resume data when navigating away from verse pages
  useEffect(() => {
    if (pathname === '/dashboard' && isMounted) {
      fetchResumeData();
    }
  }, [pathname, isMounted]);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/liked', icon: Heart, label: 'Liked' },
    { href: 'resume', icon: Play, label: 'Resume', isResume: true },
    { href: '/dashboard/achievements', icon: Trophy, label: 'Awards' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav data-tutorial="bottom-nav" className="fixed bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-md border-t border-white/5 safe-area-bottom" style={{ zIndex: 1000000 }}>
      <div className="max-w-lg mx-auto px-1 sm:px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isResume = item.isResume;
            
            if (isResume) {
              const resumeUrl = resumeData?.resumeUrl || DEFAULT_RESUME_URL;
              const displayName = resumeData?.surahName || (isLoading ? '' : 'Al-Fatiha');
              
              return (
                <Link
                  key={item.href}
                  href={resumeUrl}
                  className="relative -mt-6 flex-shrink-0"
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30"
                  >
                    {isLoading && !isMounted ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                    )}
                  </motion.div>
                  {displayName && (
                    <div className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 w-full max-w-[60px] sm:max-w-none">
                      <span className="text-[8px] sm:text-[10px] text-gray-500 block text-center truncate">
                        {displayName}
                      </span>
                    </div>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 py-2 px-1.5 sm:px-3 rounded-lg transition-colors min-w-0 flex-1 max-w-[70px] sm:max-w-none ${
                  isActive ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-green-500' : ''}`} />
                <span className="text-[8px] sm:text-[10px] font-medium truncate w-full text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
