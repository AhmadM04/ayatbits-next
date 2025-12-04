'use client';

import { useState, useEffect } from 'react';
import AyahSelectorModal from './AyahSelectorModal';

interface AyahSelectorClientProps {
  puzzles: Array<{ id: string; ayahNumber: number; isCompleted: boolean; isLiked: boolean }>;
  currentAyah: number;
  juzNumber: number;
  surahNumber: number;
}

export default function AyahSelectorClient({
  puzzles,
  currentAyah,
  juzNumber,
  surahNumber,
}: AyahSelectorClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle search button click (both desktop and mobile)
  useEffect(() => {
    const handleSearchClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    };

    // Use a small delay to ensure buttons are in the DOM
    const timeoutId = setTimeout(() => {
      const searchButton = document.getElementById('search-ayah-button');
      const searchButtonMobile = document.getElementById('search-ayah-button-mobile');
      
      if (searchButton) {
        searchButton.addEventListener('click', handleSearchClick);
      }
      if (searchButtonMobile) {
        searchButtonMobile.addEventListener('click', handleSearchClick);
      }

      return () => {
        if (searchButton) {
          searchButton.removeEventListener('click', handleSearchClick);
        }
        if (searchButtonMobile) {
          searchButtonMobile.removeEventListener('click', handleSearchClick);
        }
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Transform puzzles to format expected by modal
  const modalPuzzles = puzzles.map(p => ({
    _id: p.id,
    content: { ayahNumber: p.ayahNumber },
  }));

  return (
    <AyahSelectorModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      puzzles={modalPuzzles}
      currentAyahNumber={currentAyah}
      juzNumber={juzNumber}
      surahNumber={surahNumber}
    />
  );
}

