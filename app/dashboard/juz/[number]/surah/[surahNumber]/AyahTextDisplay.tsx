'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWordAudio } from '@/lib/hooks/useWordAudio';

interface AyahTextDisplayProps {
  ayahText: string;
  surahNumber: number;
  ayahNumber: number;
}

export default function AyahTextDisplay({ 
  ayahText, 
  surahNumber, 
  ayahNumber 
}: AyahTextDisplayProps) {
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(false);

  // Word audio hook
  const {
    playWord,
    isPlaying: isPlayingWord,
    currentWordIndex,
  } = useWordAudio({
    surahNumber,
    ayahNumber,
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
    <p
      className="text-xl sm:text-2xl md:text-3xl leading-[2] text-white text-right"
      dir="rtl"
      style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
    >
      {enableWordByWordAudio ? (
        ayahText.split(/\s+/).map((word, index) => (
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
        ayahText
      )}
    </p>
  );
}

