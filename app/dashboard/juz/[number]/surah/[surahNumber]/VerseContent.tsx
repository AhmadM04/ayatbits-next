'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import AudioPlayer from './AudioPlayer';
import TranslationDisplay from './TranslationDisplay';

interface VerseContentProps {
  ayahText: string;
  currentAyahNumber: number;
  surahNum: number;
  selectedTranslation: string;
  initialTranslation: string;
  puzzleId: string;
  previousPuzzle: { content: { ayahNumber: number } } | null;
  nextPuzzle: { content: { ayahNumber: number } } | null;
  juzNumber: number;
  surahNumber: number;
  firstAyahNumber: number;
}

export default function VerseContent({
  ayahText,
  currentAyahNumber,
  surahNum,
  selectedTranslation,
  initialTranslation,
  puzzleId,
  previousPuzzle,
  nextPuzzle,
  juzNumber,
  surahNumber,
  firstAyahNumber,
}: VerseContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleReset = () => {
    router.push(`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${firstAyahNumber}`);
  };

  return (
    <>
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28">
        {/* Arabic Verse */}
        <motion.div 
          className="relative rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 overflow-hidden"
          animate={{
            boxShadow: isPlaying 
              ? ['0 0 0 2px rgba(34, 197, 94, 0.3)', '0 0 0 4px rgba(34, 197, 94, 0.5)', '0 0 0 2px rgba(34, 197, 94, 0.3)']
              : '0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
          transition={{
            duration: 1.5,
            repeat: isPlaying ? Infinity : 0,
            ease: 'easeInOut',
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: isPlaying ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Animated glow effect when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  'radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
                  'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
                  'radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          
          <div className="relative text-center" dir="rtl">
            <div className="mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                {t('verse.ayahNumber', { number: currentAyahNumber })}
              </span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-loose sm:leading-relaxed text-white mb-4 sm:mb-6 break-words">
              {ayahText}
            </p>
            <AudioPlayer 
              surahNumber={surahNum} 
              ayahNumber={currentAyahNumber} 
              onPlayingChange={setIsPlaying}
            />
          </div>
        </motion.div>

        {/* Translation */}
        <TranslationDisplay
          surahNumber={surahNum}
          ayahNumber={currentAyahNumber}
          selectedTranslation={selectedTranslation}
          initialTranslation={initialTranslation}
        />

        {/* Ready to Start Puzzle Button */}
        <Link
          href={`/puzzle/${puzzleId}`}
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors mb-4 sm:mb-8 text-sm sm:text-base"
        >
          {t('verse.readyToStartPuzzle')}
        </Link>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-md border-t border-white/5">
        <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 py-2">
            {/* Left: Previous Button */}
            <div className="flex items-center">
              {previousPuzzle ? (
                <Link 
                  href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${previousPuzzle.content.ayahNumber}`}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-all"
                >
                  <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  <span className="text-xs sm:text-sm font-medium text-gray-300">{t('common.prev')}</span>
                </Link>
              ) : (
                <div className="w-16 sm:w-20"></div>
              )}
            </div>
            
            {/* Center: Reset Button */}
            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
              <button 
                onClick={handleReset}
                className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:border-green-500 hover:bg-green-500/10 transition-all"
              >
                <RotateCcw className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
              </button>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{t('common.reset')}</span>
            </div>
            
            {/* Right: Next Button */}
            <div className="flex items-center">
              {nextPuzzle ? (
                <Link 
                  href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${nextPuzzle.content.ayahNumber}`}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-all"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-300">{t('common.next')}</span>
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                </Link>
              ) : (
                <div className="w-16 sm:w-20"></div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
