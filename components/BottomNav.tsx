'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Trophy, Play, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { ErrorBoundary, StartReadingButton } from '@/components/ErrorBoundary';
import { useEffect } from 'react';

interface ResumeData {
  resumeUrl: string;
  surahName: string;
  ayahNumber: number;
  juzNumber: number;
  surahNumber: number;
  puzzleId: string;
}

interface BottomNavProps {
  resumeData?: ResumeData | null;
}

// Default resume URL if user hasn't started yet
const DEFAULT_RESUME_URL = '/dashboard/juz/1/surah/1?ayah=1';
const DEFAULT_SURAH_NAME = 'Al-Fatiha';

// ============================================================================
// PERFORMANCE FIX: Resume data now comes from server (no API calls!)
// ============================================================================
// Before: 2 duplicate /api/user/resume calls (6 seconds)
// After: Server-side fetch in dashboard page (0 API calls, instant!)
// ============================================================================

export default function BottomNav({ resumeData }: BottomNavProps = {}) {
  const pathname = usePathname();
  const { t } = useI18n();

  // DEBUG: Log resume data to help diagnose crashes
  useEffect(() => {
    console.log('[BottomNav] Resume data received:', {
      hasData: !!resumeData,
      resumeUrl: resumeData?.resumeUrl,
      surahName: resumeData?.surahName,
      ayahNumber: resumeData?.ayahNumber,
      juzNumber: resumeData?.juzNumber,
      surahNumber: resumeData?.surahNumber,
    });
  }, [resumeData]);

  // Hide BottomNav on puzzle pages
  if (pathname?.startsWith('/puzzle/')) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', icon: Home, labelKey: 'common.home' },
    { href: '/dashboard/liked', icon: Heart, labelKey: 'common.liked' },
    { href: 'resume', icon: Play, labelKey: 'common.resume', isResume: true },
    { href: '/dashboard/achievements', icon: Trophy, labelKey: 'common.awards' },
    { href: '/dashboard/profile', icon: User, labelKey: 'common.profile' },
  ];

  return (
    <nav data-tutorial="bottom-nav" className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 safe-area-bottom pb-2" style={{ zIndex: 1000000 }}>
      <div className="max-w-lg mx-auto px-1 sm:px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isResume = item.isResume;
            
            if (isResume) {
              // SAFETY CHECK #1: Ensure resumeData is valid before accessing properties
              // If resumeData is null/undefined, use safe defaults
              const hasValidResumeData = resumeData && 
                                        typeof resumeData === 'object' && 
                                        resumeData.resumeUrl;
              
              // SAFETY CHECK #2: Safe URL construction with fallback values
              // Build URL manually if resumeData exists but is malformed
              let resumeUrl = DEFAULT_RESUME_URL;
              if (hasValidResumeData) {
                try {
                  resumeUrl = resumeData.resumeUrl;
                } catch (error) {
                  console.error('[BottomNav] Error accessing resumeUrl:', error);
                  resumeUrl = DEFAULT_RESUME_URL;
                }
              } else if (resumeData) {
                // Construct URL from parts if resumeUrl is missing but other data exists
                const juz = resumeData.juzNumber || 1;
                const surah = resumeData.surahNumber || 1;
                const ayah = resumeData.ayahNumber || 1;
                resumeUrl = `/dashboard/juz/${juz}/surah/${surah}?ayah=${ayah}`;
                console.log('[BottomNav] Constructed URL from parts:', resumeUrl);
              }
              
              // SAFETY CHECK #3: Safe display name with fallback
              const displayName = resumeData?.surahName || DEFAULT_SURAH_NAME;
              
              // SAFETY CHECK #4: Wrap in Error Boundary
              return (
                <ErrorBoundary key={item.href} fallback={<StartReadingButton />}>
                  <Link
                    href={resumeUrl}
                    className="relative -mt-8 flex-shrink-0"
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                    </motion.div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[60px] sm:max-w-none">
                      <span className="text-[8px] sm:text-[10px] text-[#8E7F71] dark:text-gray-500 block text-center truncate">
                        {displayName}
                      </span>
                    </div>
                  </Link>
                </ErrorBoundary>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tutorial={item.labelKey === 'common.awards' ? 'awards-button' : undefined}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 py-2 px-1.5 sm:px-3 rounded-lg transition-colors min-w-0 flex-1 max-w-[70px] sm:max-w-none ${
                  isActive ? 'text-[#059669] dark:text-green-500' : 'text-[#8E7F71] dark:text-gray-500'
                }`}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-[#059669] dark:text-green-500' : ''}`} />
                <span className="text-[8px] sm:text-[10px] font-medium truncate w-full text-center leading-tight">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
