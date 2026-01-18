'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStartPageForJuz } from '@/lib/mushaf-utils';

interface MushafFABProps {
  juzNumber: number;
}

export default function MushafFAB({ juzNumber }: MushafFABProps) {
  const startPage = getStartPageForJuz(juzNumber);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', damping: 15 }}
      className="fixed bottom-24 right-4 z-40"
    >
      <Link
        href={`/dashboard/mushaf/page/${startPage}`}
        className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-3 rounded-full shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:scale-105"
      >
        <BookOpen className="w-5 h-5" />
        <span className="font-medium text-sm">Read Mushaf</span>
      </Link>
      
      {/* Tooltip on hover */}
      <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 whitespace-nowrap">
          Open page {startPage}
        </div>
      </div>
    </motion.div>
  );
}

