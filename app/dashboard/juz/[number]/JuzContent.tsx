'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { MushafFAB } from '@/components/mushaf';

interface JuzContentProps {
  juzName: string;
  surahs: Array<{
    _id: string;
    number: number;
    nameEnglish: string;
    nameArabic: string;
    puzzleCount: number;
    completedCount: number;
    startAyahNumber: number;
  }>;
  juzNumber: number;
}

export default function JuzContent({
  juzName,
  surahs,
  juzNumber,
}: JuzContentProps) {

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{juzName}</h1>
              <p className="text-xs text-gray-500">
                {surahs.length} Surahs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {surahs.map((surah) => {
            const progress = surah.puzzleCount > 0 
              ? (surah.completedCount / surah.puzzleCount) * 100 
              : 0;

            return (
              <Link
                key={surah._id}
                href={`/dashboard/juz/${juzNumber}/surah/${surah.number}`}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-green-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {surah.nameEnglish}
                    </div>
                    <div className="text-sm text-gray-500" dir="rtl">{surah.nameArabic}</div>
                    {surah.startAyahNumber > 1 && (
                      <div className="text-xs text-blue-400 mt-1">
                        Ayah {surah.startAyahNumber}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-green-500 ml-2">
                    #{surah.number}
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {surah.completedCount}/{surah.puzzleCount} puzzles
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Mushaf FAB - Opens Mushaf at the start page for this Juz */}
      <MushafFAB juzNumber={juzNumber} size="large" />

      <BottomNav />
    </div>
  );
}
