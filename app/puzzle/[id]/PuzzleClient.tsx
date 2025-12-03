'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WordPuzzle from '@/components/WordPuzzle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { I18nProvider, useI18n } from '@/lib/i18n';
import ThemeToggle from '@/components/ThemeToggle';

interface PuzzleClientProps {
  puzzle: {
    id: string;
    surah: { nameEnglish: string; nameArabic: string; number: number } | null;
    juz: { number: number } | null;
    nextAyahUrl: string | null;
    ayahViewUrl: string | null;
  };
  ayahText: string;
  userId: string;
  isLiked: boolean;
  translationCode: string;
}

function PuzzleContent({
  puzzle,
  ayahText,
  userId,
  isLiked: initialIsLiked,
}: Omit<PuzzleClientProps, 'translationCode'>) {
  const { t } = useI18n();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);


  const handleToggleLike = async () => {
    try {
      const response = await fetch(`/api/puzzles/${puzzle.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSolved = async (isCorrect: boolean) => {
    if (isCorrect) {
      try {
        await fetch(`/api/puzzles/${puzzle.id}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            score: 100,
          }),
        });

        // If there's a next ayah, smoothly transition to it
        if (puzzle.nextAyahUrl) {
          setIsTransitioning(true);
          // Wait a moment to show completion, then navigate
          setTimeout(() => {
            router.push(puzzle.nextAyahUrl!);
          }, 1500);
        }
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[var(--bg-card)] rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 border border-[var(--border-color)]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-4"
              >
                ✓
              </motion.div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">{t('puzzle.completed')}</h3>
              <p className="text-[var(--text-secondary)]">{t('puzzle.continueToNextAyah')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  {puzzle.surah?.nameEnglish || `Juz ${puzzle.juz?.number}`}
                </h1>
                {puzzle.surah && (
                  <p className="text-sm text-[var(--text-secondary)]">{puzzle.surah.nameArabic}</p>
                )}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--bg-card)] rounded-xl shadow-lg p-6 border border-[var(--border-color)] transition-colors">
          <WordPuzzle
            ayahText={ayahText}
            isLiked={isLiked}
            onToggleLike={handleToggleLike}
            onSolved={handleSolved}
            ayahViewUrl={puzzle.ayahViewUrl}
          />
        </div>
      </main>
    </div>
  );
}

export default function PuzzleClient(props: PuzzleClientProps) {
  return (
    <I18nProvider translationCode={props.translationCode}>
      <PuzzleContent {...props} />
    </I18nProvider>
  );
}
