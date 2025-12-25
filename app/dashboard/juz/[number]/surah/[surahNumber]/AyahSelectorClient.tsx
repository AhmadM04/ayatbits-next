'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Expose openModal globally for the button to call
  useEffect(() => {
    // Create a global function that the button can call
    (window as any).__openAyahSelector = openModal;
    
    // Also attach click handlers to buttons with specific IDs
    const attachHandler = () => {
      const searchButton = document.getElementById('search-ayah-button');
      const searchButtonMobile = document.getElementById('search-ayah-button-mobile');
      
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      };
      
      if (searchButton) {
        searchButton.onclick = handleClick;
      }
      if (searchButtonMobile) {
        searchButtonMobile.onclick = handleClick;
      }
    };

    // Attach immediately and also after a delay (for dynamic content)
    attachHandler();
    const timeoutId = setTimeout(attachHandler, 100);

    return () => {
      clearTimeout(timeoutId);
      delete (window as any).__openAyahSelector;
    };
  }, [openModal]);

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
