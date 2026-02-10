'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { HarakatText, HarakatModal } from '@/components/arabic';
import { type HarakatDefinition } from '@/lib/harakat-utils';
import { useWordAudio } from '@/lib/hooks/useWordAudio';

interface AyahTextDisplayProps {
  ayahText: string;
  surahNumber: number;
  ayahNumber: number;
  enableWordByWordAudio?: boolean;
}

// PERFORMANCE: Memoized word segment to prevent unnecessary re-renders
// With 50-100 words per ayah, this significantly reduces animation overhead
const WordSegment = memo(({ 
  wordText, 
  wordIndex, 
  isPlaying, 
  onWordClick,
  onHarakatClick,
}: {
  wordText: string;
  wordIndex: number;
  isPlaying: boolean;
  onWordClick: () => void;
  onHarakatClick: (def: HarakatDefinition) => void;
}) => {
  return (
    <motion.span
      onClick={onWordClick}
      animate={
        isPlaying
          ? {
              boxShadow: [
                '0 0 0 rgba(16, 185, 129, 0)',
                '0 0 20px rgba(16, 185, 129, 0.5)',
                '0 0 0 rgba(16, 185, 129, 0)',
              ],
            }
          : {
              boxShadow: '0 0 0 rgba(16, 185, 129, 0)',
            }
      }
      transition={
        isPlaying
          ? {
              boxShadow: {
                duration: 1,
                repeat: Infinity,
              },
            }
          : {
              duration: 0.3,
              boxShadow: { duration: 0.3 },
            }
      }
      className={`inline-block cursor-pointer px-1 rounded transition-colors ${
        isPlaying
          ? 'bg-green-500/30 text-green-300'
          : 'hover:bg-green-500/10'
      }`}
    >
      <HarakatText 
        text={wordText}
        onHarakatClick={onHarakatClick}
      />
    </motion.span>
  );
});

WordSegment.displayName = 'WordSegment';

export default function AyahTextDisplay({ 
  ayahText, 
  surahNumber, 
  ayahNumber,
  enableWordByWordAudio: enableWordByWordAudioProp,
}: AyahTextDisplayProps) {
  const [selectedHarakat, setSelectedHarakat] = useState<HarakatDefinition | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(enableWordByWordAudioProp ?? false);

  // Word audio hook
  const {
    playWord,
    isPlaying: isPlayingWord,
    currentWordIndex,
    segments,
  } = useWordAudio({
    surahNumber,
    ayahNumber,
    enabled: enableWordByWordAudio,
  });

  // Fetch user settings for word audio - only if not provided as prop
  useEffect(() => {
    // Skip fetch if prop was provided
    if (enableWordByWordAudioProp !== undefined) {
      return;
    }
    
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setEnableWordByWordAudio(data.enableWordByWordAudio || false);
        }
      } catch (error) {
        // Silently fail - not critical for ayah display functionality
        console.error('Failed to fetch user settings:', error);
      }
    };
    // Delay settings fetch to not block initial render
    const timer = setTimeout(fetchSettings, 0);
    return () => clearTimeout(timer);
  }, [enableWordByWordAudioProp]);

  const handleHarakatClick = useCallback((definition: HarakatDefinition) => {
    setSelectedHarakat(definition);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      <p
        className="text-xl sm:text-2xl md:text-3xl leading-[2] text-white text-right"
        dir="rtl"
        style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
      >
        {enableWordByWordAudio && segments && segments.segments.length > 0 ? (
          segments.segments.map((wordSegment, index) => (
            <WordSegment
              key={index}
              wordText={wordSegment.text}
              wordIndex={index}
              isPlaying={isPlayingWord && currentWordIndex === index}
              onWordClick={() => playWord(index)}
              onHarakatClick={handleHarakatClick}
            />
          ))
        ) : (
          <HarakatText 
            text={ayahText}
            onHarakatClick={handleHarakatClick}
          />
        )}
      </p>

      <HarakatModal
        definition={selectedHarakat}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
}
