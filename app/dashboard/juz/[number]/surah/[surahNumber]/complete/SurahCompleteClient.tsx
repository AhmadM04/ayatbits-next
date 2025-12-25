'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  CheckCircle, 
  Star,
  Sparkles,
  ChevronRight,
  Book,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SurahCompleteClientProps {
  surah: {
    number: number;
    nameEnglish: string;
    nameArabic: string;
  };
  juz: {
    number: number;
    name: string;
  };
  juzProgress: {
    totalPuzzles: number;
    completedPuzzles: number;
    percentage: number;
    isCompleted: boolean;
  };
  surahProgress: Array<{
    id: string;
    number: number;
    nameEnglish: string;
    nameArabic: string;
    totalAyahs: number;
    completedAyahs: number;
    isCompleted: boolean;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  nextSurah: {
    number: number;
    nameEnglish: string;
  } | null;
  juzNumber: number;
}

export default function SurahCompleteClient({
  surah,
  juz,
  juzProgress,
  surahProgress,
  achievements,
  nextSurah,
  juzNumber,
}: SurahCompleteClientProps) {
  const [showContent, setShowContent] = useState(false);
  const [hasPlayedConfetti, setHasPlayedConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    if (!hasPlayedConfetti) {
      setHasPlayedConfetti(true);
      
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#34d399', '#6ee7b7', '#fbbf24'],
      });

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#10b981', '#34d399'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#10b981', '#34d399'],
        });
      }, 250);

      // If juz is completed, extra celebration!
      if (juzProgress.isCompleted) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.3 },
            colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#22c55e', '#10b981'],
          });
        }, 500);
      }
    }

    // Show content after initial animation
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, [hasPlayedConfetti, juzProgress.isCompleted]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Header - Solid background */}
      <header className="relative z-10 sticky top-0 bg-[#0a0a0a] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            <Link
              href={`/dashboard/juz/${juzNumber}`}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Surah Completed!</h1>
              <p className="text-xs text-gray-500">Juz {juz.number}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', damping: 15 }}
            className="text-center mb-8"
          >
            {/* Trophy Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className="relative inline-flex items-center justify-center mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Masha Allah!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg mb-1"
            >
              You completed
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <h3 className="text-2xl font-bold text-green-400">{surah.nameEnglish}</h3>
              <p className="text-xl text-gray-300 font-arabic" dir="rtl">{surah.nameArabic}</p>
            </motion.div>
          </motion.div>

          {/* Achievements */}
          {showContent && achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Achievements Unlocked
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <div className="font-semibold text-white">{achievement.name}</div>
                      <div className="text-sm text-gray-400">{achievement.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Juz Progress */}
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Book className="w-5 h-5 text-green-400" />
                Juz {juz.number} Progress
              </h3>
              
              {/* Overall Progress */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-green-400 font-semibold">
                    {Math.round(juzProgress.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${juzProgress.percentage}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {juzProgress.completedPuzzles} / {juzProgress.totalPuzzles} ayahs completed
                </div>
                
                {juzProgress.isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
                      <Star className="w-5 h-5 fill-green-400" />
                      Juz {juz.number} Completed!
                      <Star className="w-5 h-5 fill-green-400" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Surah List */}
              <div className="space-y-2">
                {surahProgress.map((s, index) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`
                      flex items-center justify-between p-4 rounded-xl border transition-all
                      ${s.isCompleted 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-white/[0.02] border-white/5'
                      }
                      ${s.number === surah.number ? 'ring-2 ring-green-500/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${s.isCompleted ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400'}
                      `}>
                        {s.isCompleted ? <CheckCircle className="w-4 h-4" /> : s.number}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{s.nameEnglish}</div>
                        <div className="text-xs text-gray-500" dir="rtl">{s.nameArabic}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${s.isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                          {s.completedAyahs}/{s.totalAyahs}
                        </div>
                        <div className="text-xs text-gray-600">ayahs</div>
                      </div>
                      {!s.isCompleted && (
                        <Link
                          href={`/dashboard/juz/${juzNumber}/surah/${s.number}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              {nextSurah && !juzProgress.isCompleted && (
                <Link
                  href={`/dashboard/juz/${juzNumber}/surah/${nextSurah.number}`}
                  className="group relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10">Continue to {nextSurah.nameEnglish}</span>
                  <ChevronRight className="w-5 h-5 relative z-10" />
                </Link>
              )}
              
              <Link
                href={`/dashboard/juz/${juzNumber}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Juz {juz.number}
              </Link>
              
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full py-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                Return to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

