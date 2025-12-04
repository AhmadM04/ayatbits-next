'use client';

import { useState } from 'react';
import WordPuzzle from '@/components/WordPuzzle';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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
}

export default function PuzzleClient({
  puzzle,
  ayahText,
  isLiked: initialIsLiked,
  previousPuzzleId,
  nextPuzzleId,
}: PuzzleClientProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isReset, setIsReset] = useState(false);
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
    if (isCorrect) {
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

  const handlePrevious = () => {
    if (previousPuzzleId) {
      router.push(`/puzzle/${previousPuzzleId}`);
    }
  };

  const handleNext = () => {
    if (nextPuzzleId) {
      router.push(`/puzzle/${nextPuzzleId}`);
    } else {
      router.push('/dashboard');
    }
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
            />
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-md border-t border-white/5 safe-area-bottom">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={!previousPuzzleId}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                previousPuzzleId
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={handleReset}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleNext}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                nextPuzzleId
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <span className="hidden sm:inline">{nextPuzzleId ? 'Next' : 'Finish'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
