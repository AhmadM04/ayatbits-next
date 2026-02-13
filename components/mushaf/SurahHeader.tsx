'use client';

import { motion } from 'framer-motion';
import { SURAH_NAMES_ARABIC } from '@/lib/mushaf-utils';
import { HarakatColoredText } from '@/components/arabic';
import { useI18n } from '@/lib/i18n';

interface SurahHeaderProps {
  surahNumber: number;
  showBismillah?: boolean;
}

// Bismillah text (except for Surah 1 and 9)
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export default function SurahHeader({ surahNumber, showBismillah = true }: SurahHeaderProps) {
  const { t } = useI18n();
  const surahName = SURAH_NAMES_ARABIC[surahNumber] || `سورة ${surahNumber}`;
  
  // Surah 9 (At-Tawbah) doesn't have Bismillah
  // Surah 1 (Al-Fatiha) has Bismillah as its first ayah, so we don't show it separately
  const shouldShowBismillah = showBismillah && surahNumber !== 1 && surahNumber !== 9;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6"
    >
      {/* Surah Name Header - SEPIA THEME */}
      <div className="relative flex items-center justify-center mb-4">
        {/* Decorative lines */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#059669]/30 to-transparent" />
        
        {/* Surah Name Container - SEPIA THEME */}
        <div className="relative bg-[#F8F9FA] px-4 sm:px-6">
          <div className="bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 border border-[#059669]/30 rounded-xl px-4 sm:px-6 py-2 sm:py-3 shadow-sm">
            {/* Decorative corner ornaments */}
            <div className="absolute -top-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-l-2 border-[#059669] rounded-tl" />
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-r-2 border-[#059669] rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-l-2 border-[#059669] rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-r-2 border-[#059669] rounded-br" />
            
            <p
              className="text-xl sm:text-2xl font-arabic text-[#059669] text-center font-medium"
              dir="rtl"
            >
              سُورَةُ {surahName}
            </p>
            <p className="text-xs text-[#8E7F71] text-center mt-0.5 sm:mt-1">
              {t('mushaf.surah')} {surahNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Bismillah - SEPIA THEME */}
      {shouldShowBismillah && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <p
            className="text-lg sm:text-xl font-arabic text-[#4A3728]"
            dir="rtl"
          >
            <HarakatColoredText text={BISMILLAH} />
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

