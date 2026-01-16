'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWordAudio } from '@/lib/hooks/useWordAudio';

interface BismillahDisplayProps {
  bismillah: string;
  surahNumber: number;
}

export default function BismillahDisplay({ 
  bismillah, 
  surahNumber 
}: BismillahDisplayProps) {
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(false);

  // Word audio hook - using ayah 1 for Bismillah
  const {
    playWord,
    isPlaying: isPlayingWord,
    currentWordIndex,
  } = useWordAudio({
    surahNumber,
    ayahNumber: 1,
    enabled: enableWordByWordAudio,
  });

  // Fetch user settings for word audio
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setEnableWordByWordAudio(data.enableWordByWordAudio || false);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
      <p
        className="text-xl sm:text-2xl leading-loose text-green-400"
        dir="rtl"
        style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
      >
        {enableWordByWordAudio ? (
          bismillah.split(/\s+/).map((word, index) => (
            <motion.span
              key={index}
              onClick={() => playWord(index)}
              animate={
                isPlayingWord && currentWordIndex === index
                  ? {
                      boxShadow: [
                        '0 0 0 rgba(168, 85, 247, 0)',
                        '0 0 20px rgba(168, 85, 247, 0.5)',
                        '0 0 0 rgba(168, 85, 247, 0)',
                      ],
                    }
                  : {}
              }
              transition={{
                boxShadow: {
                  duration: 1,
                  repeat: Infinity,
                },
              }}
              className={`inline-block cursor-pointer px-1 rounded transition-colors ${
                isPlayingWord && currentWordIndex === index
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'hover:bg-purple-500/10'
              }`}
            >
              {word}
            </motion.span>
          ))
        ) : (
          bismillah
        )}
      </p>
    </div>
  );
}

