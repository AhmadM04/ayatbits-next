'use client';

import { useState, useCallback } from 'react';
import { HarakatText, HarakatModal } from '@/components/arabic';
import { type HarakatDefinition } from '@/lib/harakat-utils';

interface BismillahDisplayProps {
  bismillah: string;
  surahNumber: number;
}

export default function BismillahDisplay({ 
  bismillah, 
  surahNumber 
}: BismillahDisplayProps) {
  const [selectedHarakat, setSelectedHarakat] = useState<HarakatDefinition | null>(null);
  const [showHarakatModal, setShowHarakatModal] = useState(false);

  const handleHarakatClick = useCallback((definition: HarakatDefinition) => {
    setSelectedHarakat(definition);
    setShowHarakatModal(true);
  }, []);

  const handleCloseHarakatModal = useCallback(() => {
    setShowHarakatModal(false);
  }, []);

  return (
    <>
      <div className="bg-emerald-50/50 border border-[#059669]/30 rounded-xl p-4 text-center">
        <p
          className="text-xl sm:text-2xl leading-loose text-[#059669]"
          dir="rtl"
          style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
        >
          {/* Bismillah is not clickable for word-by-word audio */}
          <HarakatText 
            text={bismillah}
            onHarakatClick={handleHarakatClick}
          />
        </p>
      </div>

      <HarakatModal
        definition={selectedHarakat}
        isOpen={showHarakatModal}
        onClose={handleCloseHarakatModal}
      />
    </>
  );
}

