'use client';

import { useState, useCallback } from 'react';
import { HarakatText, HarakatModal } from '@/components/arabic';
import { type HarakatDefinition } from '@/lib/harakat-utils';

interface AyahTextDisplayProps {
  ayahText: string;
  surahNumber: number;
  ayahNumber: number;
}

export default function AyahTextDisplay({ ayahText }: AyahTextDisplayProps) {
  const [selectedHarakat, setSelectedHarakat] = useState<HarakatDefinition | null>(null);
  const [showModal, setShowModal] = useState(false);

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
        <HarakatText 
          text={ayahText}
          onHarakatClick={handleHarakatClick}
        />
      </p>

      <HarakatModal
        definition={selectedHarakat}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
}
