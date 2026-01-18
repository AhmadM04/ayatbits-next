'use client';

import { motion } from 'framer-motion';
import { SURAH_NAMES_ARABIC } from '@/lib/mushaf-utils';
import { HarakatColoredText } from '@/components/arabic';

interface SurahHeaderProps {
  surahNumber: number;
  showBismillah?: boolean;
}

// Bismillah text (except for Surah 1 and 9)
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export default function SurahHeader({ surahNumber, showBismillah = true }: SurahHeaderProps) {
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
      {/* Surah Name Header */}
      <div className="relative flex items-center justify-center mb-4">
        {/* Decorative lines */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        
        {/* Surah Name Container */}
        <div className="relative bg-[#0a0a0a] px-6">
          <div className="bg-gradient-to-r from-green-500/10 via-green-500/20 to-green-500/10 border border-green-500/20 rounded-xl px-6 py-3">
            {/* Decorative corner ornaments */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-green-500/40 rounded-tl" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-green-500/40 rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-green-500/40 rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-green-500/40 rounded-br" />
            
            <p
              className="text-2xl font-arabic text-green-400 text-center"
              dir="rtl"
            >
              سُورَةُ {surahName}
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Surah {surahNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Bismillah */}
      {shouldShowBismillah && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <p
            className="text-xl font-arabic text-white/80"
            dir="rtl"
          >
            <HarakatColoredText text={BISMILLAH} />
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

