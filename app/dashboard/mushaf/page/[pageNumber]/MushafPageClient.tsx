'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import {
  AyahRow,
  AyahContextMenu,
  PageNavigation,
  SurahHeader,
  MushafVerse,
} from '@/components/mushaf';
import { HarakatModal, HarakatLegend } from '@/components/arabic';
import { type HarakatDefinition } from '@/lib/harakat-utils';
import { TutorialWrapper } from '@/components/tutorial';
import { mushafTutorialSteps } from '@/lib/tutorial-configs';
import { useI18n } from '@/lib/i18n';

interface MushafPageClientProps {
  pageNumber: number;
  verses: MushafVerse[];
  surahStarts: number[];
  currentJuz: number;
  totalPages: number;
  selectedTranslation: string;
}

const SWIPE_THRESHOLD = 100; // Minimum swipe distance to trigger page change

export default function MushafPageClient({
  pageNumber,
  verses,
  surahStarts,
  currentJuz,
  totalPages,
  selectedTranslation,
}: MushafPageClientProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedVerse, setSelectedVerse] = useState<MushafVerse | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Harakat modal state
  const [selectedHarakat, setSelectedHarakat] = useState<HarakatDefinition | null>(null);
  const [showHarakatModal, setShowHarakatModal] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && pageNumber < totalPages) {
        setSwipeDirection('left');
        router.push(`/dashboard/mushaf/page/${pageNumber + 1}`);
      } else if (e.key === 'ArrowRight' && pageNumber > 1) {
        setSwipeDirection('right');
        router.push(`/dashboard/mushaf/page/${pageNumber - 1}`);
      } else if (e.key === 'Escape' && showContextMenu) {
        setShowContextMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, totalPages, router, showContextMenu]);

  const handleLongPress = useCallback((verse: MushafVerse) => {
    setSelectedVerse(verse);
    setShowContextMenu(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  const handleHarakatClick = useCallback((definition: HarakatDefinition) => {
    setSelectedHarakat(definition);
    setShowHarakatModal(true);
  }, []);

  const handleCloseHarakatModal = useCallback(() => {
    setShowHarakatModal(false);
  }, []);

  // Handle swipe gestures
  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // Check if swipe was significant enough
      if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
        if (offset.x > 0 && pageNumber > 1) {
          // Swipe right - go to previous page (RTL: pages go right to left)
          setSwipeDirection('right');
          router.push(`/dashboard/mushaf/page/${pageNumber - 1}`);
        } else if (offset.x < 0 && pageNumber < totalPages) {
          // Swipe left - go to next page
          setSwipeDirection('left');
          router.push(`/dashboard/mushaf/page/${pageNumber + 1}`);
        }
      }
    },
    [pageNumber, totalPages, router]
  );

  // Group verses by surah for rendering with headers
  const renderVerses = () => {
    const elements: React.ReactNode[] = [];
    let currentSurah: number | null = null;

    verses.forEach((verse, index) => {
      // Check if this is the start of a new surah
      if (verse.ayahNumber === 1 && verse.surahNumber !== currentSurah) {
        currentSurah = verse.surahNumber;
        elements.push(
          <SurahHeader
            key={`surah-header-${verse.surahNumber}`}
            surahNumber={verse.surahNumber}
            showBismillah={true}
          />
        );
      } else if (currentSurah === null) {
        // First verse of page but not start of surah
        currentSurah = verse.surahNumber;
      }

      elements.push(
        <AyahRow
          key={verse.id}
          verse={verse}
          onLongPress={handleLongPress}
          onHarakatClick={handleHarakatClick}
        />
      );
    });

    return elements;
  };

  return (
    <TutorialWrapper sectionId="mushaf_reading" steps={mushafTutorialSteps} delay={1000}>
      <div className="min-h-screen bg-[#0a0a0a] text-white" data-tutorial="mushaf-page">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Back Button */}
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>

              {/* Page Navigation */}
              <div data-tutorial="page-navigation">
                <PageNavigation
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  currentJuz={currentJuz}
                />
              </div>

              {/* Home Button */}
              <Link
                href="/dashboard"
                className="p-2 -mr-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </header>

      {/* Main Content with Swipe Support */}
      <motion.main
        ref={containerRef}
        className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        data-tutorial="page-content"
      >
        {/* Page Info Badge */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400">
            {t('mushaf.juz')} {currentJuz}
          </span>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
            {t('mushaf.page')} {pageNumber}
          </span>
        </div>

        {/* Mushaf Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pageNumber}
            initial={{ opacity: 0, x: swipeDirection === 'left' ? 50 : swipeDirection === 'right' ? -50 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection === 'left' ? -50 : swipeDirection === 'right' ? 50 : 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-6"
          >
            {/* Arabic Text Container */}
            <div
              className="text-xl sm:text-2xl md:text-3xl leading-[2.2] sm:leading-[2.5] font-arabic text-right"
              dir="rtl"
              style={{ 
                fontFamily: 'var(--font-arabic, "Amiri", serif)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'none',
              }}
              data-tutorial="ayah-row"
            >
              {renderVerses()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe Hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            {t('mushaf.swipeInstruction')}
          </p>
        </div>
      </motion.main>

      {/* Footer Navigation (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 safe-area-bottom">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Previous Page */}
            <button
              onClick={() => pageNumber > 1 && router.push(`/dashboard/mushaf/page/${pageNumber - 1}`)}
              disabled={pageNumber <= 1}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${pageNumber > 1 
                  ? 'bg-white/5 hover:bg-white/10 text-white' 
                  : 'text-gray-600 cursor-not-allowed'
                }
              `}
            >
              <span className="text-sm">{t('mushaf.previous')}</span>
            </button>

            {/* Page Indicator */}
            <div className="text-center">
              <span className="text-sm text-gray-400">
                {t('mushaf.page')} {pageNumber} / {totalPages}
              </span>
            </div>

            {/* Next Page */}
            <button
              onClick={() => pageNumber < totalPages && router.push(`/dashboard/mushaf/page/${pageNumber + 1}`)}
              disabled={pageNumber >= totalPages}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${pageNumber < totalPages 
                  ? 'bg-white/5 hover:bg-white/10 text-white' 
                  : 'text-gray-600 cursor-not-allowed'
                }
              `}
            >
              <span className="text-sm">{t('mushaf.next')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <AyahContextMenu
        verse={selectedVerse}
        isOpen={showContextMenu}
        onClose={handleCloseMenu}
        selectedTranslation={selectedTranslation}
      />

      {/* Harakat Modal */}
      <HarakatModal
        definition={selectedHarakat}
        isOpen={showHarakatModal}
        onClose={handleCloseHarakatModal}
      />

      {/* Harakat Legend (Floating Help Button) */}
      <div data-tutorial="harakat-legend">
        <HarakatLegend 
          variant="floating" 
          onHarakatSelect={handleHarakatClick}
        />
      </div>
      </div>
    </TutorialWrapper>
  );
}

