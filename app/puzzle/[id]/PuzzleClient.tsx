'use client';

import { useState } from 'react';
import WordPuzzle from '@/components/WordPuzzle';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PuzzleClientProps {
  puzzle: {
    id: string;
    surah: { nameEnglish: string; nameArabic: string; number?: number } | null;
    juz: { number: number } | null;
  };
  ayahText: string;
  userId: string;
  isLiked: boolean;
  previousPuzzleId?: string | null;
  nextPuzzleId?: string | null;
  versePageUrl?: string;
}

export default function PuzzleClient({
  puzzle,
  ayahText,
  isLiked: initialIsLiked,
  previousPuzzleId,
  nextPuzzleId,
  versePageUrl,
}: PuzzleClientProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isReset, setIsReset] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleToggleLike = async () => {
    try {
      if (isLiked) {
        await apiDelete(`/api/puzzles/${puzzle.id}/like`);
      } else {
        await apiPost(`/api/puzzles/${puzzle.id}/like`);
      }
      setIsLiked(!isLiked);
      showToast(isLiked ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      if (error instanceof NetworkError) {
        showToast('Network error. Please check your connection.', 'error');
      } else {
        showToast(getErrorMessage(error), 'error');
      }
    }
  };

  const handleSolved = async (isCorrect: boolean) => {
    if (isCorrect && !hasSavedProgress) {
      setHasSavedProgress(true);
      try {
        await apiPost(`/api/puzzles/${puzzle.id}/progress`, {
          status: 'COMPLETED',
          score: 100,
        });
        showToast('Progress saved!', 'success');
      } catch (error) {
        if (error instanceof NetworkError) {
          showToast('Failed to save progress. Your progress may not be saved.', 'error');
        } else {
          console.error('Failed to save progress:', error);
        }
      }
    }
  };

  const handleReset = () => {
    setIsReset(true);
    setTimeout(() => setIsReset(false), 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {puzzle.surah?.nameEnglish || `Juz ${puzzle.juz?.number}`}
                </h1>
                {puzzle.surah && (
                  <p className="text-sm text-gray-400" dir="rtl">{puzzle.surah.nameArabic}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleToggleLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <motion.div
          key={isReset ? 'reset' : 'normal'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        >
          {/* Animated border glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl" />
          <div className="relative z-10">
            <WordPuzzle
              ayahText={ayahText}
              isLiked={isLiked}
              onToggleLike={handleToggleLike}
              onSolved={handleSolved}
              onMistakeLimitExceeded={() => {
                if (versePageUrl) {
                  router.push(versePageUrl);
                } else if (puzzle.surah?.number && puzzle.juz?.number) {
                  router.push(`/dashboard/juz/${puzzle.juz.number}/surah/${puzzle.surah.number}`);
                } else {
                  router.push('/dashboard');
                }
              }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
