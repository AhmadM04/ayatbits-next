'use client';

import { useState } from 'react';
import WordPuzzle from '@/components/WordPuzzle';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PuzzleClientProps {
  puzzle: {
    id: string;
    surah: { nameEnglish: string; nameArabic: string; number?: number } | null;
    juz: { number: number } | null;
  };
  ayahText: string;
  userId: string;
  isLiked: boolean;
}

export default function PuzzleClient({
  puzzle,
  ayahText,
  isLiked: initialIsLiked,
}: PuzzleClientProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const { showToast, showNetworkError } = useToast();

  const handleToggleLike = async () => {
    try {
      if (isLiked) {
        await apiDelete(`/api/puzzles/${puzzle.id}/like`);
      } else {
        await apiPost(`/api/puzzles/${puzzle.id}/like`);
      }
      setIsLiked(!isLiked);
      showToast(isLiked ? 'Removed from favorites' : 'Added to favorites', 'success', 2000);
    } catch (error) {
      if (error instanceof NetworkError) {
        showNetworkError();
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
        showToast('Progress saved!', 'success', 2000);
      } catch (error) {
        if (error instanceof NetworkError) {
          showNetworkError('Failed to save progress. Your progress may not be saved.');
        } else {
          console.error('Failed to save progress:', error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {puzzle.surah?.nameEnglish || `Juz ${puzzle.juz?.number}`}
              </h1>
              {puzzle.surah && (
                <p className="text-sm text-gray-600">{puzzle.surah.nameArabic}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <WordPuzzle
            ayahText={ayahText}
            isLiked={isLiked}
            onToggleLike={handleToggleLike}
            onSolved={handleSolved}
          />
        </div>
      </main>
    </div>
  );
}

