'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { HarakatColoredText } from '@/components/arabic';
import { TutorialWrapper } from '@/components/tutorial';
import { likedTutorialSteps } from '@/lib/tutorial-configs';
import { useI18n } from '@/lib/i18n';

interface LikedAyah {
  id: string;
  puzzleId: string;
  ayahText: string;
  ayahNumber: number;
  surahNumber: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  juzNumber: number;
  likedAt: string;
}

export default function LikedAyahsContent() {
  const { t } = useI18n();
  const [likedAyahs, setLikedAyahs] = useState<LikedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/user/liked')
      .then(res => res.json())
      .then(data => {
        setLikedAyahs(data.likedAyahs || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleUnlike = async (puzzleId: string) => {
    try {
      const response = await fetch(`/api/puzzles/${puzzleId}/like`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setLikedAyahs(prev => prev.filter(a => a.puzzleId !== puzzleId));
      }
    } catch (error) {
      console.error('Failed to unlike:', error);
    }
  };

  // Show loading during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#4A3728] dark:text-white pb-20">
        <header className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3">
              <div className="w-9 h-9 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <TutorialWrapper sectionId="liked_collection" steps={likedTutorialSteps} delay={800}>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#4A3728] dark:text-white pb-20">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3" data-tutorial="liked-header">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#8E7F71] dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-[#4A3728] dark:text-white">{t('liked.title')}</h1>
                <p className="text-xs text-[#8E7F71] dark:text-gray-400">{t('liked.ayahsSaved', { count: likedAyahs.length })}</p>
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : likedAyahs.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-2">{t('liked.noLikedYet')}</h2>
            <p className="text-[#8E7F71] dark:text-gray-400 text-sm mb-6">
              {t('liked.tapHeartToSave')}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {t('search.startLearning')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-tutorial="liked-list">
            {likedAyahs.map((ayah, index) => (
              <motion.div
                key={ayah.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-sm rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-medium text-[#4A3728] dark:text-white">
                      {ayah.surahNameArabic || ayah.surahNameEnglish}
                    </div>
                    <div className="text-xs text-[#8E7F71] dark:text-gray-400">
                      {t('liked.ayahInfo', { ayahNumber: ayah.ayahNumber, juzNumber: ayah.juzNumber })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" data-tutorial="liked-actions">
                    <Link
                      href={`/dashboard/juz/${ayah.juzNumber}/surah/${ayah.surahNumber}?ayah=${ayah.ayahNumber}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#8E7F71] dark:text-gray-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleUnlike(ayah.puzzleId)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#EF4444]"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
                <p 
                  className="font-arabic text-lg sm:text-xl text-[#4A3728] dark:text-white"
                  dir="rtl"
                >
                  <HarakatColoredText text={ayah.ayahText} />
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
      </div>
    </TutorialWrapper>
  );
}







