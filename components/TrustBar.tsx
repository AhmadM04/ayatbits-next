'use client';

import { motion } from 'framer-motion';

// Islamic/Quran-related trust indicators
const trustLogos = [
  { name: 'Al-Azhar', icon: '🕌' },
  { name: 'Islamic University', icon: '📚' },
  { name: 'Quran Academy', icon: '📖' },
  { name: 'Muslim Community', icon: '🤲' },
  { name: 'Masjid Network', icon: '🕋' },
  { name: 'Islamic Studies', icon: '✨' },
];

export default function TrustBar() {
  return (
    <section className="py-12 bg-[var(--bg-secondary)] border-y border-[var(--border-color)] transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[var(--text-muted)] mb-8">
          Trusted by learners worldwide
        </p>
        
        {/* Scrolling logos */}
        <div className="relative">
          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-12 items-center"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate logos for seamless scroll */}
              {[...trustLogos, ...trustLogos, ...trustLogos].map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 whitespace-nowrap opacity-50 hover:opacity-100 transition-opacity"
                >
                  <span className="text-2xl">{logo.icon}</span>
                  <span className="text-lg font-medium text-[var(--text-muted)]">
                    {logo.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent pointer-events-none" />
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">10K+</div>
            <div className="text-sm text-[var(--text-muted)]">Active Learners</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">6,236</div>
            <div className="text-sm text-[var(--text-muted)]">Verses Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">18+</div>
            <div className="text-sm text-[var(--text-muted)]">Translations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">30</div>
            <div className="text-sm text-[var(--text-muted)]">Juz Complete</div>
          </div>
        </div>
      </div>
    </section>
  );
}



