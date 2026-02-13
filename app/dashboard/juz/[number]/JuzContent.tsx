'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { MushafFAB } from '@/components/mushaf';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#4A3728] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8E7F71]" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#4A3728]">{juzName}</h1>
              <p className="text-xs text-[#8E7F71]">
                {t('juz.surahsCount', { count: surahs.length })}
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
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:border-[#059669]/50 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#4A3728] truncate">
                      {surah.nameEnglish}
                    </div>
                    <div className="text-sm text-[#8E7F71]" dir="rtl">{surah.nameArabic}</div>
                    {surah.startAyahNumber > 1 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {t('juz.ayah')} {surah.startAyahNumber}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-[#059669] ml-2">
                    #{surah.number}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-gradient-to-r from-[#059669] to-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-[#8E7F71]">
                  {surah.completedCount}/{surah.puzzleCount} {t('achievements.puzzles').toLowerCase()}
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
