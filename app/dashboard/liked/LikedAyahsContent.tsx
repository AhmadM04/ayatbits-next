'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { HarakatColoredText } from '@/components/arabic';
import { TutorialWrapper } from '@/components/tutorial';
import { likedTutorialSteps } from '@/lib/tutorial-configs';

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
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3">
              <div className="w-9 h-9 bg-gray-800 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <TutorialWrapper sectionId="liked_collection" steps={likedTutorialSteps} delay={800}>
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3" data-tutorial="liked-header">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Liked Ayahs</h1>
                <p className="text-xs text-gray-500">{likedAyahs.length} ayahs saved</p>
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : likedAyahs.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No liked ayahs yet</h2>
            <p className="text-gray-500 text-sm mb-6">
              Tap the heart icon on any ayah to save it here
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Start Learning
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
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {ayah.surahNameArabic || ayah.surahNameEnglish}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ayah {ayah.ayahNumber} • Juz {ayah.juzNumber}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" data-tutorial="liked-actions">
                    <Link
                      href={`/dashboard/juz/${ayah.juzNumber}/surah/${ayah.surahNumber}?ayah=${ayah.ayahNumber}`}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleUnlike(ayah.puzzleId)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
                <p 
                  className="text-lg leading-relaxed text-gray-300 text-right font-arabic"
                  dir="rtl"
                  style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
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







