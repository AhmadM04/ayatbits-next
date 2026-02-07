'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import TafseerButtons from './TafseerButtons';

interface SurahHeaderProps {
  juzNumber: string;
  juzNumberValue: number;
  surahName: string;
  completedAyahs: number;
  totalAyahs: number;
  currentPuzzle: any;
  surahNumber: number;
  selectedAyah: number;
  selectedTranslation: string;
  ayahText: string;
  subscriptionPlan?: string;
  mushafPageNumber: number | null;
}

export default function SurahHeader({
  juzNumber,
  juzNumberValue,
  surahName,
  completedAyahs,
  totalAyahs,
  currentPuzzle,
  surahNumber,
  selectedAyah,
  selectedTranslation,
  ayahText,
  subscriptionPlan,
  mushafPageNumber,
}: SurahHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14">
          <Link
            href={`/dashboard/juz/${juzNumber}`}
            className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex-1 min-w-0 mx-3">
            <h1 className="text-base font-semibold truncate">{surahName}</h1>
            <p className="text-xs text-gray-500 truncate">
              {t('juz.juzProgressHeader', { 
                number: juzNumberValue, 
                completed: completedAyahs, 
                total: totalAyahs 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tafseer Buttons */}
            {currentPuzzle && (
              <TafseerButtons
                surahNumber={surahNumber}
                ayahNumber={selectedAyah}
                selectedTranslation={selectedTranslation}
                ayahText={ayahText}
                subscriptionPlan={subscriptionPlan}
              />
            )}
            {mushafPageNumber && (
              <Link
                href={`/dashboard/mushaf/page/${mushafPageNumber}`}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                title="View in Mushaf"
              >
                <BookOpen className="w-5 h-5 text-gray-400" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

