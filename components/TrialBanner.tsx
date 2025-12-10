'use client';

import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TrialBannerProps {
  daysLeft: number;
}

export default function TrialBanner({ daysLeft }: TrialBannerProps) {
  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full px-4 py-2 flex items-center justify-center gap-3 text-sm ${
        isUrgent 
          ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-orange-500/20' 
          : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/20'
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-orange-400' : 'text-green-400'}`} />
      <span className="text-white">
        <span className="font-semibold">
          {daysLeft === 1 ? '1 day' : `${daysLeft} days`}
        </span>
        {' '}left in your free trial
      </span>
      <Link 
        href="/pricing"
        className={`inline-flex items-center gap-1 font-medium hover:underline ${
          isUrgent ? 'text-orange-400' : 'text-green-400'
        }`}
      >
        Subscribe now
        <ArrowRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}





