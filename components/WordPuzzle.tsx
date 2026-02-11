// components/WordPuzzle.tsx
// MODIFIED: 2026-01-17 - Fixed drag/audio issues - NO GLOW ON BANK WORDS
// MODIFIED: 2026-01-18 - Added harakat coloring
// MODIFIED: 2026-01-18 - Migrated to Quran.com API for consistent Uthmani text
// MODIFIED: 2026-01-18 - Fixed word-by-word audio index for Muqatta'at letters
// MODIFIED: 2026-01-30 - Fixed auto-play audio index offset bug (was off by 2 on Muqatta'at surahs)
// MODIFIED: 2026-02-09 - Performance optimizations: disabled logs in production
// MODIFIED: 2026-02-09 - Performance: Removed mounted/isLoading states, deferred settings fetch
// MODIFIED: 2026-02-11 - LAZY WINDOW ARCHITECTURE: Raw data cache outside React state, render only active verse
'use client';

import { useCallback, useEffect, useMemo, useState, useRef, memo } from 'react';

// Conditional logging - only in development for performance
const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : (..._args: any[]) => {};

// ============================================================================
// RAW DATA CACHE - OUTSIDE REACT STATE (LAZY WINDOW ARCHITECTURE)
// ============================================================================
// This bypasses React's state management entirely to avoid Immer/Proxy overhead
// Each puzzle is cached by a unique key (surahNumber-ayahNumber)
// Zero CPU cost - no re-renders, no proxies, no diffing
//
// BENEFITS:
// 1. Immer/State Bottleneck: RAW data never enters React state → no Proxy wrapping
// 2. React Commit Bottleneck: Only 10-20 words rendered (active verse), not 6000
// 3. Zero derived calculations: No loops over entire Surah
//
// USAGE:
// - Data is loaded once per verse and cached
// - Component only reads the ACTIVE verse from cache
// - Switching verses is instant (no re-tokenization)
// ============================================================================
let RAW_PUZZLE_CACHE: Map<string, {
  originalTokens: import('@/lib/puzzle-logic').WordToken[];
  ayahText: string;
  wordTransliterations: Array<{ text: string; transliteration: string }>;
}> = new Map();

// Cache management utility - call this to free memory if needed
export function clearPuzzleCache(surahNumber?: number) {
  if (surahNumber) {
    // Clear specific surah
    const keysToDelete: string[] = [];
    RAW_PUZZLE_CACHE.forEach((_, key) => {
      if (key.startsWith(`${surahNumber}-`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => RAW_PUZZLE_CACHE.delete(key));
    log('[LAZY WINDOW] Cleared cache for Surah', surahNumber, '-', keysToDelete.length, 'verses');
  } else {
    // Clear all
    const size = RAW_PUZZLE_CACHE.size;
    RAW_PUZZLE_CACHE.clear();
    log('[LAZY WINDOW] Cleared entire cache -', size, 'verses');
  }
}

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  defaultDropAnimationSideEffects,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { RefreshCw, CheckCircle2, Volume2, Lightbulb, X, Languages } from 'lucide-react';
import {
  shuffleArray,
  tokenizeAyah,
  type WordToken,
} from '@/lib/puzzle-logic';
import { calculateTipsForAyah } from '@/lib/tips-system';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ConditionalMotion, ConditionalAnimatePresence, useReducedMotion } from '@/components/ConditionalMotion';
import { useWordAudio } from '@/lib/hooks/useWordAudio';
import { HarakatColoredText } from '@/components/arabic';
import { useI18n } from '@/lib/i18n';

interface WordPuzzleProps {
  ayahText: string;
  surahNumber?: number;
  ayahNumber?: number;
  onSolved?: (isCorrect: boolean) => void;
  onWordCorrect?: (wordIndex: number, word: string) => void;
  onMistakeLimitExceeded?: () => void;
  transliteration?: string;
  wordTransliterations?: Array<{ text: string; transliteration: string }>;
  isLoadingTransliteration?: boolean;
  enableWordByWordAudio?: boolean;
}

const MAX_MISTAKES = 3;

// Droppable slot for the answer area
function DropSlot({
  position,
  expectedToken,
  placedToken,
  isActive,
  isHinted = false,
  isFadingHint = false,
  showTransliteration = false,
  enableWordAudio = false,
  onWordClick,
  playingWordIndex,
}: {
  position: number;
  expectedToken: WordToken;
  placedToken: WordToken | null;
  isActive: boolean;
  isHinted?: boolean;
  isFadingHint?: boolean;
  showTransliteration?: boolean;
  enableWordAudio?: boolean;
  onWordClick?: (wordIndex: number) => void;
  playingWordIndex?: number | null;
}) {
  // PERFORMANCE FIX: Only pass minimal data to avoid Immer proxy wrapping
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${position}`,
    data: { type: 'slot', position, expectedTokenId: expectedToken.id }, // Only pass ID
  });

  const handleWordClick = (e: React.MouseEvent) => {
    if (enableWordAudio && placedToken && placedToken.norm === expectedToken.norm && onWordClick) {
      e.stopPropagation();
      onWordClick(position);
    }
  };

  const isPlayingThis = playingWordIndex === position;

  return (
    <ConditionalMotion
      as="div"
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isPlayingThis
          ? {
              opacity: 1,
              scale: 1,
              boxShadow: [
                '0 0 0 rgba(16, 185, 129, 0)',
                '0 0 25px rgba(16, 185, 129, 0.6)',
                '0 0 0 rgba(16, 185, 129, 0)',
              ],
            }
          : isFadingHint
          ? {
              opacity: 1,
              scale: 1,
              x: 0,
              boxShadow: '0 0 0 rgba(16, 185, 129, 0)',
            }
          : isHinted
          ? {
              opacity: 1,
              scale: 1,
              x: [0, -4, 4, -4, 4, 0],
              boxShadow: [
                '0 0 0 rgba(16, 185, 129, 0)',
                '0 0 20px rgba(16, 185, 129, 0.5)',
                '0 0 0 rgba(16, 185, 129, 0)',
              ],
            }
          : { 
              opacity: 1, 
              scale: 1,
              boxShadow: '0 0 0 rgba(16, 185, 129, 0)'
            }
      }
      transition={
        isPlayingThis
          ? {
              boxShadow: {
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : isFadingHint
          ? {
              duration: 0.7,
              ease: 'easeOut',
            }
          : isHinted
          ? {
              x: {
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 0.5,
              },
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
              },
            }
          : { 
              delay: position * 0.02, 
              duration: 0.3,
              boxShadow: { duration: 0.3 }
            }
      }
      fallbackClassName={isPlayingThis ? 'ring-2 ring-green-500' : isHinted ? 'ring-2 ring-green-500/50' : ''}
      onClick={handleWordClick}
      className={`
        relative min-w-[50px] min-h-[44px] px-3 py-2 rounded-lg
        flex flex-col items-center justify-center
        transition-all duration-150
        ${enableWordAudio && placedToken && placedToken.norm === expectedToken.norm ? 'cursor-pointer' : ''}
        ${placedToken 
          ? 'bg-green-500/20 border-2 border-green-500'
          : isFadingHint
            ? 'bg-[#1a1a1a]/50 border-2 border-dashed border-white/20'
            : isHinted
            ? 'bg-green-500/30 border-2 border-green-400 scale-105'
            : isOver && isActive
              ? 'bg-green-500/30 border-2 border-green-400 scale-105'
              : 'bg-[#1a1a1a]/50 border-2 border-dashed border-white/20'
        }
      `}
    >
      {placedToken ? (
        <ConditionalMotion as="div" className="flex flex-col items-center group relative">
          <ConditionalMotion
            as="span"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-base font-medium font-arabic text-green-400 flex items-center gap-1"
          >
            <HarakatColoredText text={placedToken.text} />
            {enableWordAudio && (
              <Volume2 className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            {!enableWordAudio && <CheckCircle2 className="w-3 h-3 text-green-400 hidden sm:block" />}
          </ConditionalMotion>
          {showTransliteration && placedToken.transliteration && (
            <ConditionalMotion
              as="span"
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full mt-1 text-xs text-gray-400 italic whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
            >
              {placedToken.transliteration}
            </ConditionalMotion>
          )}
        </ConditionalMotion>
      ) : (
        <span className="text-gray-600 text-xs">
          {isOver && isActive ? '✓' : (position + 1)}
        </span>
      )}
    </ConditionalMotion>
  );
}

// Bank words support both drag and click/tap
// Memoized for performance - only re-renders when props change
const DraggableWord = memo(function DraggableWord({
  token,
  isOverlay = false,
  isShaking = false,
  isHinted = false,
  isFadingHint = false,
  showTransliteration = false,
  onTap,
}: {
  token: WordToken;
  isOverlay?: boolean;
  isShaking?: boolean;
  isHinted?: boolean;
  isFadingHint?: boolean;
  showTransliteration?: boolean;
  onTap?: (token: WordToken) => void;
}) {
  // PERFORMANCE FIX: Only pass minimal data to avoid Immer proxy wrapping
  // dnd-kit internally uses Immer which wraps all data in Proxies
  // Passing full token objects causes 12-second freeze on large datasets
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: token.id,
    data: { type: 'bank-item', tokenId: token.id }, // Only pass ID, not full object
  });
  
  log('[DND] DraggableWord rendered', { 
    id: token.id, 
    hasListeners: !!listeners, 
    hasAttributes: !!attributes,
    isOverlay,
    isHinted,
    isFadingHint
  });

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging and not overlay
    if (!isDragging && !isOverlay && onTap) {
      e.stopPropagation();
      onTap(token);
    }
  };

  return (
    <ConditionalMotion
      as="div"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      tabIndex={-1}
      role="button"
      data-component="draggable-word-v2-fixed"
      data-hinted={isHinted}
      data-bank-word="true"
      initial={false}
      animate={
        isShaking
          ? { x: [0, -8, 8, -8, 8, 0] }
          : isFadingHint
          ? {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1a1a1a',
              color: 'rgb(229, 229, 229)',
            }
          : {}
      }
      exit={{ opacity: 0 }}
      transition={
        isShaking
          ? { duration: 0.3 }
          : isFadingHint
          ? { duration: 0.7, ease: 'easeOut' }
          : { duration: 0.15, ease: 'easeOut' }
      }
      className={`
        relative cursor-grab active:cursor-grabbing group
        px-4 py-2.5 rounded-xl
        text-lg font-medium font-arabic text-center
        transition-all duration-150 select-none
        ${isDragging ? 'opacity-40' : 'opacity-100'}
        ${
          isOverlay
            ? 'bg-[#1a1a1a] border-2 border-green-500 shadow-xl text-white scale-105 z-50'
            : isFadingHint
              ? 'bg-[#1a1a1a] border border-white/10 text-gray-200'
              : isHinted
              ? 'bg-[#1a1a1a] border-2 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/30'
              : 'bg-[#1a1a1a] border border-white/10 text-gray-200 hover:bg-[#222] hover:border-white/20 active:scale-95'
        }
      `}
      style={{ pointerEvents: 'auto' }}
    >
      <span className="flex items-center gap-1 pointer-events-none">
        <HarakatColoredText text={token.text} />
      </span>
      {showTransliteration && token.transliteration && !isOverlay && (
        <ConditionalMotion
          as="span"
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-gray-400 italic whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          {token.transliteration}
        </ConditionalMotion>
      )}
    </ConditionalMotion>
  );
});

function AnswerArea({
  cacheKey,
  placedTokenIds,
  activeTokenId,
  hintedSlotPosition,
  isFadingHint,
  showTransliteration,
  enableWordAudio = false,
  onWordClick,
  playingWordIndex,
  t,
}: {
  cacheKey: string;
  placedTokenIds: Map<number, string>;  // position -> tokenId
  activeTokenId: string | null;
  hintedSlotPosition: number | null;
  isFadingHint: boolean;
  showTransliteration: boolean;
  enableWordAudio?: boolean;
  onWordClick?: (wordIndex: number) => void;
  playingWordIndex?: number | null;
  t: (key: string, params?: Record<string, any>) => string;
}) {
  // PERFORMANCE FIX: Look up data from cache instead of receiving as props
  // This prevents Immer from proxy-wrapping large arrays
  const cachedData = RAW_PUZZLE_CACHE.get(cacheKey);
  if (!cachedData) return null;
  
  const { originalTokens } = cachedData;
  
  return (
    <div
      dir="rtl"
      data-tutorial="answer-area"
      className="min-h-[80px] w-full rounded-xl border-2 border-dashed p-3 transition-all duration-300 border-white/10 bg-[#0f0f0f]"
    >
      <div className="flex flex-wrap items-center gap-2" style={{ justifyContent: 'flex-start' }}>
        {originalTokens.map((token, index) => {
          const placedTokenId = placedTokenIds.get(index);
          const placedToken = placedTokenId 
            ? originalTokens.find(t => t.id === placedTokenId) || null
            : null;
          
          return (
            <DropSlot
              key={`slot-${index}`}
              position={index}
              expectedToken={token}
              placedToken={placedToken}
              isActive={activeTokenId !== null}
              isHinted={hintedSlotPosition === index}
              isFadingHint={isFadingHint && hintedSlotPosition === index}
              showTransliteration={showTransliteration}
              enableWordAudio={enableWordAudio}
              onWordClick={onWordClick}
              playingWordIndex={playingWordIndex}
            />
          );
        })}
      </div>
      {placedTokenIds.size === 0 && (
        <p className="text-gray-500 text-xs text-center mt-3">
          {t('wordPuzzle.dropEachWord')}
        </p>
      )}
    </div>
  );
}

function WordBank({
  cacheKey,
  bankTokenIds,
  shakingIds,
  hintedTokenId,
  isFadingHint,
  showTransliteration,
  onWordTap,
  t,
}: {
  cacheKey: string;
  bankTokenIds: string[];  // Array of token IDs in the bank
  shakingIds: Set<string>;
  hintedTokenId: string | null;
  isFadingHint: boolean;
  showTransliteration: boolean;
  onWordTap?: (token: WordToken) => void;
  t: (key: string, params?: Record<string, any>) => string;
}) {
  // PERFORMANCE FIX: Look up data from cache instead of receiving as props
  // This prevents Immer from proxy-wrapping large arrays
  const cachedData = RAW_PUZZLE_CACHE.get(cacheKey);
  if (!cachedData) return null;
  
  const { originalTokens } = cachedData;
  const bankTokens = bankTokenIds.map(id => 
    originalTokens.find(t => t.id === id)
  ).filter((t): t is WordToken => t !== undefined);
  
  return (
    <div className="mt-6" dir="rtl" data-tutorial="word-bank">
      <p className="text-xs text-gray-500 text-center mb-3">
        {t('wordPuzzle.dragOrTap')}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {bankTokens.map((token) => (
            <DraggableWord
              key={token.id}
              token={token}
              isShaking={shakingIds.has(token.id)}
              isHinted={hintedTokenId === token.id}
              isFadingHint={isFadingHint && hintedTokenId === token.id}
              showTransliteration={showTransliteration}
              onTap={onWordTap}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function WordPuzzle({
  ayahText,
  surahNumber,
  ayahNumber,
  onSolved,
  onWordCorrect,
  onMistakeLimitExceeded,
  transliteration = '',
  wordTransliterations = [],
  isLoadingTransliteration = false,
  enableWordByWordAudio: enableWordByWordAudioProp,
}: WordPuzzleProps) {
  const { t } = useI18n();
  const { showToast } = useToast();
  
  // ============================================================================
  // LAZY WINDOW ARCHITECTURE - Step 1: Cache Key
  // ============================================================================
  // Create a unique cache key for this specific verse
  const cacheKey = `${surahNumber}-${ayahNumber}`;
  
  // ============================================================================
  // PERFORMANCE FIX: INSTANT INITIALIZATION (No useEffect / No Loading State)
  // ============================================================================
  
  // 1. Memoize the puzzle state so it is ready ON FIRST RENDER
  const puzzleState = useMemo(() => {
    // A. Check Cache (Synchronous)
    let data = RAW_PUZZLE_CACHE.get(cacheKey);

    // B. Cache Miss? Populate it SYNCHRONOUSLY (Blocking for 5ms is better than a re-render)
    if (!data) {
      log('[LAZY WINDOW] Cache miss (Sync) - tokenizing:', cacheKey);
      const tokens = tokenizeAyah(ayahText);
      
      // Apply transliterations
      if (wordTransliterations.length > 0) {
        tokens.forEach((token, index) => {
          if (index < wordTransliterations.length) {
            token.transliteration = wordTransliterations[index].transliteration;
          }
        });
      }
      
      RAW_PUZZLE_CACHE.set(cacheKey, {
        originalTokens: tokens,
        ayahText,
        wordTransliterations,
      });
      data = RAW_PUZZLE_CACHE.get(cacheKey)!;
    }

    // C. Return the render-ready data
    return {
      originalTokens: data.originalTokens,
      // Shuffle bank immediately
      bankIds: shuffleArray([...data.originalTokens]).map(t => t.id)
    };
  }, [cacheKey, ayahText, wordTransliterations]); // Re-run only if verse changes

  // 2. Sync the Ref (for event handlers)
  const puzzleDataRef = useRef<{
    originalTokens: WordToken[];
    bankIds: string[];
  }>(puzzleState);
  puzzleDataRef.current = puzzleState;

  // 3. Extract data for render (No 'if !isLoaded' check needed anymore!)
  const { originalTokens, bankIds } = puzzleState;
  
  // STATE FOR UI ONLY - only things that need to trigger re-renders
  // PERFORMANCE FIX: Store IDs instead of full objects
  const [placedTokenIds, setPlacedTokenIds] = useState<Map<number, string>>(new Map());  // position -> tokenId
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const hasCompletedRef = useRef(false);
  const [shakingIds, setShakingIds] = useState<Set<string>>(new Set());
  
  // Tips system state
  const [availableTips, setAvailableTips] = useState(0);
  const [usedTips, setUsedTips] = useState(0);
  const [activeHint, setActiveHint] = useState<{ tokenId: string; slotPosition: number } | null>(null);
  const [isFadingHint, setIsFadingHint] = useState(false);
  
  // Word audio state - use prop if provided, otherwise fetch from API
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(enableWordByWordAudioProp ?? false);
  
  const pendingToast = useRef<{ message: string; type: 'success' | 'error'; duration: number } | null>(null);
  const onSolvedRef = useRef(onSolved);
  
  // Initialize tips (calculation only for THIS verse, not entire Surah)
  useEffect(() => {
    const tipsCount = calculateTipsForAyah(originalTokens.length);
    setAvailableTips(tipsCount);
  }, [originalTokens.length]);
  
  // Word audio hook
  const {
    playWord,
    stopPlayback: stopWordPlayback,
    isPlaying: isPlayingWord,
    currentWordIndex,
  } = useWordAudio({
    surahNumber,
    ayahNumber,
    enabled: enableWordByWordAudio,
  });
  
  // Keep ref updated
  useEffect(() => {
    onSolvedRef.current = onSolved;
  }, [onSolved]);

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
        // Silently fail - not critical for puzzle functionality
        log('Failed to fetch user settings:', error);
      }
    };
    // Delay settings fetch to not block initial render
    const timer = setTimeout(fetchSettings, 0);
    return () => clearTimeout(timer);
  }, [enableWordByWordAudioProp]);

  // Calculate offset values for word audio index mapping
  // We need to account for MUQATTA'AT: Split into individual letters in puzzle but kept as one word in API
  // Note: Bismillah is NOT included in the API word segments - it's handled separately at the surah level
  const muqattaatTokens = useMemo(() => {
    if (originalTokens.length === 0) return 0;
    
    // Check for Muqatta'at (isolated letters at the start of some surahs)
    const firstWord = ayahText.trim().split(/\s+/)[0] || '';
    
    const MUQATTAAT_PATTERNS = [
      'الم', 'المص', 'الر', 'المر', 'كهيعص', 'طه', 'طسم', 'طس', 'يس', 'ص', 'حم', 'حم عسق', 'عسق', 'ق', 'ن',
      'الٓمٓ', 'الٓمٓصٓ', 'الٓرٰ', 'الٓمٓرٰ', 'كٓهيعٓصٓ', 'طٰهٰ', 'طٰسٓمٓ', 'طٰسٓ', 'يٰسٓ', 'صٓ', 'حٰمٓ', 'قٓ', 'نٓ',
      'الۤمۤ', 'الۤمۤصۤ', 'الۤرٰ', 'الۤمۤرٰ',
    ];
    
    const normalizeForPattern = (text: string) => {
      return text.replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, '').trim();
    };
    
    const normalizedFirst = normalizeForPattern(firstWord);
    const isMuqattaat = MUQATTAAT_PATTERNS.some(
      pattern => normalizeForPattern(pattern) === normalizedFirst
    );
    
    let muqattaatLetterCount = 0;
    if (isMuqattaat) {
      // Count how many letters the Muqatta'at was split into
      for (const token of originalTokens) {
        const isBaseLetter = /^[\u0621-\u063A\u0641-\u064A]/.test(token.text);
        const isSingleLetter = token.text.replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, '').length === 1;
        
        if (isBaseLetter && isSingleLetter) {
          muqattaatLetterCount++;
        } else {
          break;
        }
      }
      log(`🔤 [WORD AUDIO] Muqatta'at detected - ${muqattaatLetterCount} puzzle tokens for 1 API word`);
    }
    
    return muqattaatLetterCount;
  }, [originalTokens.length, ayahText]);

  // Handler for word click in answer area
  const handleAnswerWordClick = useCallback((wordIndex: number) => {
    if (!enableWordByWordAudio) return;
    
    log('🎯 [WORD AUDIO] Word clicked at puzzle position:', wordIndex);
    log('  - Muqatta\'at tokens:', muqattaatTokens);
    
    // Convert puzzle position to API word index
    let apiIndex: number;
    
    if (muqattaatTokens > 0 && wordIndex < muqattaatTokens) {
      // Clicking on a Muqatta'at letter - all letters map to the first API word (index 0)
      apiIndex = 0;
      log('  ℹ️ Clicked on Muqatta\'at letter - playing combined word at API index:', apiIndex);
    } else if (muqattaatTokens > 0) {
      // Word after Muqatta'at letters
      // The Muqatta'at letters (e.g., 3 letters) in puzzle map to 1 word in API (index 0)
      // So puzzle position 3 = API position 1, puzzle position 4 = API position 2, etc.
      apiIndex = wordIndex - muqattaatTokens + 1;
      log('  ✓ Word after Muqatta\'at - puzzle pos:', wordIndex, '→ API index:', apiIndex);
    } else {
      // No Muqatta'at - direct 1:1 mapping
      apiIndex = wordIndex;
      log('  ✓ Regular word - puzzle pos:', wordIndex, '→ API index:', apiIndex);
    }
    
    playWord(apiIndex);
  }, [playWord, enableWordByWordAudio, muqattaatTokens]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const resetState = useCallback(() => {
    // Get data from cache, not from state
    const cachedData = RAW_PUZZLE_CACHE.get(cacheKey);
    if (!cachedData) return;
    
    const originalTokens = cachedData.originalTokens;
    
    setPlacedTokenIds(new Map());
    // Update bank in ref with fresh shuffle from cache (IDs only)
    puzzleDataRef.current.bankIds = shuffleArray([...originalTokens]).map(t => t.id);
    setMistakeCount(0);
    setHasExceededMistakeLimit(false);
    hasCompletedRef.current = false;
    setShakingIds(new Set());
    pendingToast.current = null;
    
    // Reset tips system (only calculate for THIS verse)
    const tipsCount = calculateTipsForAyah(originalTokens.length);
    log('[TIPS] resetState - calculating tips:', {
      originalTokensLength: originalTokens.length,
      tipsCount,
    });
    setAvailableTips(tipsCount);
    setUsedTips(0);
    setActiveHint(null);
    setIsFadingHint(false);
  }, [cacheKey]);

  useEffect(() => {
    if (pendingToast.current) {
      const { message, type, duration } = pendingToast.current;
      showToast(message, type, duration);
      pendingToast.current = null;
    }
  });

  // ============================================================================
  // LAZY WINDOW ARCHITECTURE - Step 5: No Derived Calculations
  // ============================================================================
  // Check completion using ONLY the current verse data (no iterations over full Surah)
  const isComplete = useMemo(() => {
    // Simple comparison - no loops over 6000 words!
    return originalTokens.length > 0 && placedTokenIds.size === originalTokens.length;
  }, [placedTokenIds.size, originalTokens.length]);

  useEffect(() => {
    log('[COMPLETION] useEffect running', { isComplete, hasCompleted: hasCompletedRef.current });
    if (isComplete && !hasCompletedRef.current) {
      log('Puzzle completed! Calling onSolved callback', { 
        onSolved: !!onSolvedRef.current, 
        onSolvedType: typeof onSolvedRef.current,
        isComplete,
        hasCompleted: hasCompletedRef.current,
        isPlayingWord,
        currentWordIndex
      });
      hasCompletedRef.current = true;
      
      // Show toast immediately
      setTimeout(() => {
        showToast('Mashallah! Perfect!', 'success', 2000);
      }, 0);
      
      // Wait for word audio to finish before calling onSolved
      // If word audio is playing, wait 1.5 seconds to let it complete
      // Otherwise, wait a short 500ms to let the user see the completion
      const delay = isPlayingWord ? 1500 : 500;
      
      log(`⏱️ Waiting ${delay}ms before calling onSolved (word audio playing: ${isPlayingWord})`);
      
      const timeoutId = setTimeout(() => {
        log('⏰ TIMEOUT FIRED after', delay, 'ms');
        if (onSolvedRef.current && typeof onSolvedRef.current === 'function') {
          log('🚀 Calling onSolved(true) after delay');
          try {
            onSolvedRef.current(true);
            log('✅ onSolved(true) called successfully');
          } catch (error) {
            console.error('❌ Error calling onSolved:', error);
          }
        } else {
          console.error('❌ onSolved is not available!', { 
            onSolved: onSolvedRef.current, 
            type: typeof onSolvedRef.current 
          });
        }
      }, delay);
      
      // Cleanup timeout ONLY if component unmounts - not on re-render!
      return () => {
        log('🧹 Cleanup called - clearing timeout (this cancels navigation!)');
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]); // ONLY isComplete - hasCompleted is now a ref!

  const registerMistake = useCallback((tokenId: string) => {
    setShakingIds((prev) => new Set(prev).add(tokenId));
    setTimeout(() => {
      setShakingIds((prev) => {
        const next = new Set(prev);
        next.delete(tokenId);
        return next;
      });
    }, 300);

    setMistakeCount((prev) => {
      const next = prev + 1;
      
      // Trigger automatic tip on every 2nd mistake (if tips available)
      if (next % 2 === 0 && usedTips < availableTips && !activeHint) {
        setTimeout(() => {
          const { originalTokens, bankIds } = puzzleDataRef.current;
          
          // Find the first empty slot and the correct word for it
          let firstEmptySlot = -1;
          for (let i = 0; i < originalTokens.length; i++) {
            if (!placedTokenIds.has(i)) {
              firstEmptySlot = i;
              break;
            }
          }
          
          if (firstEmptySlot !== -1) {
            const correctToken = originalTokens[firstEmptySlot];
            const correctWordId = bankIds.find(id => {
              const token = originalTokens.find(t => t.id === id);
              return token && token.norm === correctToken.norm;
            });
            
            if (correctWordId) {
              setIsFadingHint(false);
              setActiveHint({
                tokenId: correctWordId,
                slotPosition: firstEmptySlot,
              });
              setUsedTips((prev) => prev + 1);
              
              setTimeout(() => {
                showToast('💡 Hint: Watch the highlighted word and slot!', 'success', 3000);
              }, 100);
            }
          }
        }, 400);
      }
      
      setTimeout(() => {
        if (next >= MAX_MISTAKES) {
          showToast(t('wordPuzzle.tooManyMistakes'), 'error', 2500);
          setTimeout(() => onMistakeLimitExceeded?.(), 1200);
        } else {
          showToast(t('wordPuzzle.wrongPosition'), 'error', 1000);
        }
      }, 0);
      
      if (next >= MAX_MISTAKES) {
        setHasExceededMistakeLimit(true);
        return MAX_MISTAKES;
      }
      return next;
    });
  }, [onMistakeLimitExceeded, showToast, usedTips, availableTips, placedTokenIds, activeHint, t]);

  // Manual tip triggering (when user clicks tips button)
  const handleManualTip = useCallback(() => {
    const { originalTokens, bankIds } = puzzleDataRef.current;
    
    log('[TIPS] handleManualTip called', {
      usedTips,
      availableTips,
      hasActiveHint: !!activeHint,
      bankLength: bankIds.length,
      originalTokensLength: originalTokens.length,
      placedTokensSize: placedTokenIds.size,
    });

    // Check if tips are available
    if (usedTips >= availableTips) {
      log('[TIPS] No tips available - usedTips >= availableTips');
      showToast(t('wordPuzzle.noTipsAvailable'), 'error', 2000);
      return;
    }

    // Don't trigger if hint is already active
    if (activeHint) {
      log('[TIPS] Hint already active');
      showToast(t('wordPuzzle.tipAlreadyShowing'), 'info', 2000);
      return;
    }

    // Find the first empty slot and the correct word for it
    let firstEmptySlot = -1;
    for (let i = 0; i < originalTokens.length; i++) {
      if (!placedTokenIds.has(i)) {
        firstEmptySlot = i;
        break;
      }
    }
    
    log('[TIPS] First empty slot:', firstEmptySlot);
    
    if (firstEmptySlot === -1) {
      showToast(t('wordPuzzle.allSlotsFilled'), 'info', 2000);
      return;
    }

    const correctToken = originalTokens[firstEmptySlot];
    log('[TIPS] Looking for token:', { 
      text: correctToken.text, 
      norm: correctToken.norm,
      id: correctToken.id 
    });
    log('[TIPS] Bank IDs:', bankIds);
    
    // Find the correct word in the bank - use exact ID match first, then fall back to norm match
    let correctWordId = bankIds.find(id => id === correctToken.id);
    if (!correctWordId) {
      // Fall back to norm matching for duplicate words
      const correctTokenInBank = originalTokens.find(t => bankIds.includes(t.id) && t.norm === correctToken.norm);
      correctWordId = correctTokenInBank?.id;
    }
    
    log('[TIPS] Found word ID in bank:', correctWordId || 'NOT FOUND');
    
    if (correctWordId) {
      setIsFadingHint(false);
      const hint = {
        tokenId: correctWordId,
        slotPosition: firstEmptySlot,
      };
      log('[TIPS] Setting activeHint:', hint);
      setActiveHint(hint);
      setUsedTips((prev) => prev + 1);
      showToast(t('wordPuzzle.tipActivated'), 'success', 3000);
    } else {
      log('[TIPS] Could not find correct word in bank');
      showToast(t('wordPuzzle.unableToFindWord'), 'error', 2000);
    }
  }, [usedTips, availableTips, activeHint, placedTokenIds, showToast, t]);

  // Try to place a token on a specific slot
  // Returns true if placed successfully, false otherwise
  const tryPlaceTokenOnSlot = useCallback(
    (token: WordToken, slotPosition: number): boolean => {
      const originalTokens = puzzleDataRef.current.originalTokens;
      
      // Check if slot is already filled
      if (placedTokenIds.has(slotPosition)) {
        log('[PLACEMENT] Slot already filled:', { slotPosition });
        return false;
      }

      // Check if this token is correct for THIS specific slot
      const expectedToken = originalTokens[slotPosition];
      
      log('[PLACEMENT] Attempting placement:', {
        slotPosition,
        token: { id: token.id, text: token.text, norm: token.norm, position: token.position },
        expected: { id: expectedToken.id, text: expectedToken.text, norm: expectedToken.norm, position: expectedToken.position },
        normMatch: token.norm === expectedToken.norm,
        tokenNormBytes: [...token.norm].map(c => c.charCodeAt(0)),
        expectedNormBytes: [...expectedToken.norm].map(c => c.charCodeAt(0)),
      });
      
      if (token.norm !== expectedToken.norm) {
        // Wrong token for this slot - count as mistake
        log('[PLACEMENT] ❌ REJECTED - norm mismatch');
        registerMistake(token.id);
        return false;
      }

      // Correct! Place the token
      log('[PLACEMENT] ✅ ACCEPTED - placing token');
      setPlacedTokenIds((prev) => {
        const next = new Map(prev);
        next.set(slotPosition, token.id);  // Store ID only
        return next;
      });

      // Remove from bank in ref (IDs only)
      puzzleDataRef.current.bankIds = puzzleDataRef.current.bankIds.filter((id) => id !== token.id);
      
      onWordCorrect?.(slotPosition, token.text);
      
      // Clear hint if this was the hinted word - with fade animation
      setActiveHint((prev) => {
        if (prev && prev.tokenId === token.id) {
          // Trigger fade animation first
          setIsFadingHint(true);
          // Then clear the hint after fade duration
          setTimeout(() => {
            setActiveHint(null);
            setIsFadingHint(false);
          }, 700); // 700ms fade duration
          return prev; // Keep the hint active during fade
        }
        return prev;
      });
      
      // Auto-play word audio if enabled
      if (enableWordByWordAudio) {
        log('[PLACEMENT] 🔊 Auto-playing word audio for position:', slotPosition);
        handleAnswerWordClick(slotPosition);
      }
      
      return true;
    },
    [placedTokenIds, onWordCorrect, registerMistake, enableWordByWordAudio, handleAnswerWordClick]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      log('[DND] handleDragStart called', event.active.id);
      const activeId = event.active.id as string;
      setActiveTokenId(activeId);
      log('[DND] Set active token ID:', activeId);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      log('[DND] handleDragEnd called', { activeId: event.active.id, overId: event.over?.id });
      const { active, over } = event;
      setActiveTokenId(null);

      // If not dropped on anything, just return (no mistake)
      if (!over || hasExceededMistakeLimit) {
        log('[DND] Early return - no over or exceeded limit');
        return;
      }

      const activeId = active.id as string;
      const originalTokens = puzzleDataRef.current.originalTokens;
      const token = originalTokens.find((t) => t.id === activeId);
      if (!token) return;

      // Check if dropped on a slot
      const overId = over.id as string;
      if (!overId.startsWith('slot-')) {
        // Dropped somewhere else, not on a slot - no mistake, just return
        return;
      }

      // Extract slot position from ID
      const slotPosition = parseInt(overId.replace('slot-', ''), 10);
      if (isNaN(slotPosition)) return;

      // Try to place on that specific slot
      // This will check if the token is correct for THAT slot
      tryPlaceTokenOnSlot(token, slotPosition);
    },
    [hasExceededMistakeLimit, tryPlaceTokenOnSlot]
  );

  // Handle tap/click on bank words - place in next available slot
  const handleWordTap = useCallback(
    (token: WordToken) => {
      if (hasExceededMistakeLimit) return;

      const originalTokens = puzzleDataRef.current.originalTokens;
      
      // Find the first empty slot
      let firstEmptySlot = -1;
      for (let i = 0; i < originalTokens.length; i++) {
        if (!placedTokenIds.has(i)) {
          firstEmptySlot = i;
          break;
        }
      }

      if (firstEmptySlot === -1) {
        // All slots filled
        return;
      }

      // Try to place the token in the first empty slot
      tryPlaceTokenOnSlot(token, firstEmptySlot);
    },
    [hasExceededMistakeLimit, placedTokenIds, tryPlaceTokenOnSlot]
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  // No loading check needed - data is ready on first render!
  // ============================================================================
  // LAZY WINDOW ARCHITECTURE - Step 6: Render ONLY Active Verse (IDs ONLY)
  // ============================================================================
  // Get ONLY the current verse data (e.g., 10-20 words, NOT 6000)
  // Data is already available from useMemo above
  
  log('[LAZY WINDOW] Rendering active verse -', originalTokens.length, 'tokens');

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Compact header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${
            hasExceededMistakeLimit 
              ? 'bg-red-500/20 border-red-500/30' 
              : 'bg-[#1a1a1a] border-white/10'
          }`}>
            <span className={`text-xs font-medium ${hasExceededMistakeLimit ? 'text-red-400' : 'text-gray-400'}`}>
              {t('wordPuzzle.mistakes')}: {mistakeCount}/{MAX_MISTAKES}
            </span>
          </div>
          
          {/* Tips Counter - Clickable Button */}
          <motion.button
            onClick={(e) => {
              log('[TIPS] Button clicked!', e);
              handleManualTip();
            }}
            disabled={usedTips >= availableTips || hasExceededMistakeLimit}
            animate={
              usedTips < availableTips && !activeHint && !hasExceededMistakeLimit
                ? {
                    boxShadow: [
                      '0 0 0 rgba(34, 197, 94, 0)',
                      '0 0 15px rgba(34, 197, 94, 0.4)',
                      '0 0 0 rgba(34, 197, 94, 0)',
                    ],
                  }
                : {}
            }
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              usedTips >= availableTips || hasExceededMistakeLimit
                ? 'bg-gray-500/10 border-gray-500/30 cursor-not-allowed opacity-50'
                : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 cursor-pointer active:scale-95'
            }`}
            title={
              usedTips >= availableTips
                ? 'No tips available'
                : hasExceededMistakeLimit
                ? 'Cannot use tips (too many mistakes)'
                : 'Click to get a tip!'
            }
            data-tutorial="hint-button"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${usedTips >= availableTips ? 'text-gray-500' : 'text-green-400'}`} />
            <span className={`text-xs font-medium ${usedTips >= availableTips ? 'text-gray-500' : 'text-green-400'}`}>
              {t('wordPuzzle.tips')}: {usedTips}/{availableTips}
            </span>
          </motion.button>
          
          {/* Dismiss Hint Button - only shows when hint is active */}
          {activeHint && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setActiveHint(null);
                setIsFadingHint(false);
                // Don't count dismissed tip - decrement used tips
                setUsedTips((prev) => Math.max(0, prev - 1));
              }}
              className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors flex items-center gap-1.5"
              title="Dismiss hint"
            >
              <X className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{t('wordPuzzle.dismiss')}</span>
            </motion.button>
          )}
          
          <button
            onClick={resetState}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-gray-500">
          {placedTokenIds.size}/{originalTokens.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(placedTokenIds.size / originalTokens.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AnswerArea
          cacheKey={cacheKey}
          placedTokenIds={placedTokenIds}
          activeTokenId={activeTokenId}
          hintedSlotPosition={activeHint?.slotPosition ?? null}
          isFadingHint={isFadingHint}
          showTransliteration={wordTransliterations.length > 0}
          enableWordAudio={enableWordByWordAudio}
          onWordClick={handleAnswerWordClick}
          playingWordIndex={currentWordIndex !== null ? (() => {
            // Convert API word index to puzzle position
            if (muqattaatTokens > 0 && currentWordIndex === 0) {
              // Playing the Muqatta'at word - highlight the last Muqatta'at letter
              return muqattaatTokens - 1;
            } else {
              // Playing a regular word or word after Muqatta'at
              return muqattaatTokens > 0 
                ? muqattaatTokens - 1 + currentWordIndex
                : currentWordIndex;
            }
          })() : null}
          t={t}
        />
        <WordBank
          cacheKey={cacheKey}
          bankTokenIds={bankIds}
          shakingIds={shakingIds}
          hintedTokenId={activeHint?.tokenId ?? null}
          isFadingHint={isFadingHint}
          showTransliteration={wordTransliterations.length > 0}
          onWordTap={handleWordTap}
          t={t}
        />

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTokenId ? (() => {
            const token = originalTokens.find(t => t.id === activeTokenId);
            return token ? <DraggableWord token={token} isOverlay /> : null;
          })() : null}
        </DragOverlay>
      </DndContext>

      {/* Transliteration Display */}
      {transliteration && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-teal-500/5 border border-teal-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-medium text-teal-400">Transliteration</span>
          </div>
          <p className="text-base text-gray-300 italic leading-relaxed">
            {transliteration}
          </p>
        </motion.div>
      )}

      {isLoadingTransliteration && (
        <div className="mt-6 bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          <span className="ml-2 text-sm text-gray-400">Loading transliteration...</span>
        </div>
      )}
    </div>
  );
}
