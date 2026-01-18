// components/WordPuzzle.tsx
// MODIFIED: 2026-01-17 - Fixed drag/audio issues - NO GLOW ON BANK WORDS
'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
import { RefreshCw, CheckCircle2, Play, Pause, Volume2, Lightbulb, X, Languages } from 'lucide-react';
import {
  shuffleArray,
  tokenizeAyah,
  type WordToken,
} from '@/lib/puzzle-logic';
import { calculateTipsForAyah } from '@/lib/tips-system';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordAudio } from '@/lib/hooks/useWordAudio';

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
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${position}`,
    data: { type: 'slot', position, expectedToken },
  });

  const handleWordClick = (e: React.MouseEvent) => {
    if (enableWordAudio && placedToken && placedToken.norm === expectedToken.norm && onWordClick) {
      e.stopPropagation();
      onWordClick(position);
    }
  };

  const isPlayingThis = playingWordIndex === position;

  return (
    <motion.div
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
          : { opacity: 1, scale: 1 }
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
          : { delay: position * 0.02, duration: 0.3 }
      }
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
        <motion.div className="flex flex-col items-center group relative">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-base font-medium font-arabic text-green-400 flex items-center gap-1"
          >
            {placedToken.text}
            {enableWordAudio && (
              <Volume2 className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            {!enableWordAudio && <CheckCircle2 className="w-3 h-3 text-green-400 hidden sm:block" />}
          </motion.span>
          {showTransliteration && placedToken.transliteration && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full mt-1 text-xs text-gray-400 italic whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
            >
              {placedToken.transliteration}
            </motion.span>
          )}
        </motion.div>
      ) : (
        <span className="text-gray-600 text-xs">
          {isOver && isActive ? '✓' : (position + 1)}
        </span>
      )}
    </motion.div>
  );
}

// Bank words are drag-only, no click/audio functionality
function DraggableWord({
  token,
  isOverlay = false,
  isShaking = false,
  isHinted = false,
  isFadingHint = false,
  showTransliteration = false,
}: {
  token: WordToken;
  isOverlay?: boolean;
  isShaking?: boolean;
  isHinted?: boolean;
  isFadingHint?: boolean;
  showTransliteration?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: token.id,
    data: { type: 'bank-item', token },
  });

  // Debug: log when component renders to verify new code is loaded
  if (isHinted) {
    console.log('[DraggableWord V2] Hinted word rendered:', token.text, 'NO GLOW ANIMATION');
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      tabIndex={-1}
      role="none"
      data-component="draggable-word-v2-fixed"
      data-hinted={isHinted}
      data-bank-word="true"
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
      transition={
        isShaking
          ? { duration: 0.3 }
          : isFadingHint
          ? { duration: 0.7, ease: 'easeOut' }
          : { duration: 0.3 }
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
      onPointerDown={(e) => {
        // Prevent any click/audio behavior - only allow dragging
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Additional prevention for mouse-triggered clicks
        e.stopPropagation();
      }}
      onClick={(e) => {
        // Explicitly prevent click events from triggering audio
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <span className="flex items-center gap-1 pointer-events-none">
        {token.text}
      </span>
      {showTransliteration && token.transliteration && !isOverlay && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-gray-400 italic whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          {token.transliteration}
        </motion.span>
      )}
    </motion.div>
  );
}

function AnswerArea({
  correctTokens,
  placedTokens,
  activeTokenId,
  isPlayingRecitation,
  hintedSlotPosition,
  isFadingHint,
  showTransliteration,
  enableWordAudio = false,
  onWordClick,
  playingWordIndex,
}: {
  correctTokens: WordToken[];
  placedTokens: Map<number, WordToken>;
  activeTokenId: string | null;
  isPlayingRecitation: boolean;
  hintedSlotPosition: number | null;
  isFadingHint: boolean;
  showTransliteration: boolean;
  enableWordAudio?: boolean;
  onWordClick?: (wordIndex: number) => void;
  playingWordIndex?: number | null;
}) {
  return (
    <div
      dir="rtl"
      className={`
        min-h-[80px] w-full rounded-xl border-2 border-dashed p-3
        transition-all duration-300
        ${isPlayingRecitation 
          ? 'border-green-500/50 bg-[#0f0f0f] shadow-[0_0_30px_rgba(34,197,94,0.3)] ring-2 ring-green-500/20' 
          : 'border-white/10 bg-[#0f0f0f]'
        }
      `}
    >
      <div className="flex flex-wrap items-center gap-2" style={{ justifyContent: 'flex-start' }}>
        {correctTokens.map((token, index) => (
          <DropSlot
            key={`slot-${index}`}
            position={index}
            expectedToken={token}
            placedToken={placedTokens.get(index) || null}
            isActive={activeTokenId !== null}
            isHinted={hintedSlotPosition === index}
            isFadingHint={isFadingHint && hintedSlotPosition === index}
            showTransliteration={showTransliteration}
            enableWordAudio={enableWordAudio}
            onWordClick={onWordClick}
            playingWordIndex={playingWordIndex}
          />
        ))}
      </div>
      {placedTokens.size === 0 && (
        <p className="text-gray-500 text-xs text-center mt-3">
          Drop each word in its correct slot
        </p>
      )}
    </div>
  );
}

function WordBank({
  bank,
  shakingIds,
  hintedTokenId,
  isFadingHint,
  showTransliteration,
}: {
  bank: WordToken[];
  shakingIds: Set<string>;
  hintedTokenId: string | null;
  isFadingHint: boolean;
  showTransliteration: boolean;
}) {
  return (
    <div className="mt-6" dir="rtl">
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {bank.map((token) => (
            <motion.div
              key={token.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
            >
              <DraggableWord
                token={token}
                isShaking={shakingIds.has(token.id)}
                isHinted={hintedTokenId === token.id}
                isFadingHint={isFadingHint && hintedTokenId === token.id}
                showTransliteration={showTransliteration}
              />
            </motion.div>
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
}: WordPuzzleProps) {
  const { showToast } = useToast();
  
  // Tokenize ayah and map transliterations to tokens
  const originalTokens = useMemo(() => {
    const tokens = tokenizeAyah(ayahText);
    
    console.log('[INIT] Original tokens created:', tokens.length);
    console.log('[INIT] Token details:', tokens.map(t => ({ 
      id: t.id, 
      text: t.text, 
      norm: t.norm, 
      position: t.position 
    })));
    
    // Map transliterations to tokens if available
    if (wordTransliterations.length > 0) {
      // Match transliterations to tokens by index
      tokens.forEach((token, index) => {
        if (index < wordTransliterations.length) {
          token.transliteration = wordTransliterations[index].transliteration;
        }
      });
    }
    
    return tokens;
  }, [ayahText, wordTransliterations]);

  // Initialize bank with shuffled tokens immediately
  const [bank, setBank] = useState<WordToken[]>(() => shuffleArray(originalTokens));
  const [placedTokens, setPlacedTokens] = useState<Map<number, WordToken>>(new Map());
  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shakingIds, setShakingIds] = useState<Set<string>>(new Set());
  const [isPlayingRecitation, setIsPlayingRecitation] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Tips system state - initialize with calculated value from originalTokens
  const [availableTips, setAvailableTips] = useState(() => {
    const initialTips = calculateTipsForAyah(originalTokens.length);
    console.log('[TIPS] Initial state - calculated tips:', initialTips, 'for', originalTokens.length, 'tokens');
    return initialTips;
  });
  const [usedTips, setUsedTips] = useState(0);
  const [activeHint, setActiveHint] = useState<{ tokenId: string; slotPosition: number } | null>(null);
  const [isFadingHint, setIsFadingHint] = useState(false);
  
  // Word audio state
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(false);
  
  const pendingToast = useRef<{ message: string; type: 'success' | 'error'; duration: number } | null>(null);
  const onSolvedRef = useRef(onSolved);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Handler for word click in answer area
  const handleAnswerWordClick = useCallback((wordIndex: number) => {
    console.log('🎯 handleAnswerWordClick called with index:', wordIndex);
    console.log('🎵 enableWordByWordAudio:', enableWordByWordAudio);
    console.log('📚 originalTokens length:', originalTokens.length);
    playWord(wordIndex);
  }, [playWord, enableWordByWordAudio, originalTokens]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const resetState = useCallback(() => {
    setIsLoading(true);
    setPlacedTokens(new Map());
    setBank(shuffleArray(originalTokens));
    setMistakeCount(0);
    setHasExceededMistakeLimit(false);
    setHasCompleted(false);
    setShakingIds(new Set());
    pendingToast.current = null;
    
    // Reset tips system
    const tipsCount = calculateTipsForAyah(originalTokens.length);
    console.log('[TIPS] resetState - calculating tips:', {
      originalTokensLength: originalTokens.length,
      tipsCount,
    });
    setAvailableTips(tipsCount);
    setUsedTips(0);
    setActiveHint(null);
    setIsFadingHint(false);
    
    // Stop audio on reset
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingRecitation(false);
    }
    
    setTimeout(() => setIsLoading(false), 0);
  }, [originalTokens]);
  
  // Audio player functions
  const getAudioUrl = useCallback(async () => {
    if (!surahNumber || !ayahNumber) return null;
    
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/alafasy`);
      if (response.ok) {
        const data = await response.json();
        if (data.data?.audio) {
          return data.data.audio;
        }
      }
    } catch (error) {
      console.error('API fetch failed:', error);
    }
    
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;
  }, [surahNumber, ayahNumber]);

  const handlePlayPause = useCallback(async () => {
    if (!surahNumber || !ayahNumber) {
      setAudioError('Audio not available');
      return;
    }

    try {
      if (!audioRef.current) {
        setIsLoadingAudio(true);
        setAudioError(null);
        
        const actualAudioUrl = await getAudioUrl();
        
        if (!actualAudioUrl) {
          throw new Error('No audio URL available');
        }
        
        const audio = new Audio(actualAudioUrl);
        
        audio.addEventListener('loadeddata', () => {
          setIsLoadingAudio(false);
        });
        
        audio.addEventListener('error', () => {
          setIsLoadingAudio(false);
          setAudioError('Failed to load audio');
        });
        
        audio.addEventListener('ended', () => {
          setIsPlayingRecitation(false);
          audioRef.current = null;
        });
        
        audio.addEventListener('play', () => {
          setIsPlayingRecitation(true);
        });
        
        audio.addEventListener('pause', () => {
          setIsPlayingRecitation(false);
        });
        
        audioRef.current = audio;
      }

      if (isPlayingRecitation) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (err) {
      setIsLoadingAudio(false);
      setAudioError('Failed to play audio');
      console.error('Audio error:', err);
    }
  }, [surahNumber, ayahNumber, isPlayingRecitation, getAudioUrl]);
  
  // Cleanup audio on unmount or ayah change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [surahNumber, ayahNumber]);

  useEffect(() => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (pendingToast.current) {
      const { message, type, duration } = pendingToast.current;
      showToast(message, type, duration);
      pendingToast.current = null;
    }
  });

  // Check if puzzle is complete
  const isComplete = useMemo(() => {
    return originalTokens.length > 0 && placedTokens.size === originalTokens.length;
  }, [placedTokens.size, originalTokens.length]);

  useEffect(() => {
    if (isComplete && !hasCompleted) {
      console.log('Puzzle completed! Calling onSolved callback', { 
        onSolved: !!onSolvedRef.current, 
        onSolvedType: typeof onSolvedRef.current,
        isComplete,
        hasCompleted,
        isPlayingWord,
        currentWordIndex
      });
      setHasCompleted(true);
      
      // Show toast immediately
      setTimeout(() => {
        showToast('Mashallah! Perfect!', 'success', 2000);
      }, 0);
      
      // Wait for word audio to finish before calling onSolved
      // If word audio is playing, wait 1.5 seconds to let it complete
      // Otherwise, wait a short 500ms to let the user see the completion
      const delay = isPlayingWord ? 1500 : 500;
      
      console.log(`⏱️ Waiting ${delay}ms before calling onSolved (word audio playing: ${isPlayingWord})`);
      
      const timeoutId = setTimeout(() => {
        if (onSolvedRef.current && typeof onSolvedRef.current === 'function') {
          console.log('🚀 Calling onSolved(true) after delay');
          try {
            onSolvedRef.current(true);
            console.log('✅ onSolved(true) called successfully');
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
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [isComplete, hasCompleted, showToast, isPlayingWord, currentWordIndex]); // Added isPlayingWord and currentWordIndex

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
          // Find the first empty slot and the correct word for it
          let firstEmptySlot = -1;
          for (let i = 0; i < originalTokens.length; i++) {
            if (!placedTokens.has(i)) {
              firstEmptySlot = i;
              break;
            }
          }
          
          if (firstEmptySlot !== -1) {
            const correctToken = originalTokens[firstEmptySlot];
            const correctWordInBank = bank.find(t => t.norm === correctToken.norm);
            
            if (correctWordInBank) {
              setIsFadingHint(false);
              setActiveHint({
                tokenId: correctWordInBank.id,
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
          showToast('Too many mistakes! Review the ayah again.', 'error', 2500);
          setTimeout(() => onMistakeLimitExceeded?.(), 1200);
        } else {
          showToast('Wrong position! Try again.', 'error', 1000);
        }
      }, 0);
      
      if (next >= MAX_MISTAKES) {
        setHasExceededMistakeLimit(true);
        return MAX_MISTAKES;
      }
      return next;
    });
  }, [onMistakeLimitExceeded, showToast, usedTips, availableTips, originalTokens, placedTokens, bank, activeHint]);

  // Manual tip triggering (when user clicks tips button)
  const handleManualTip = useCallback(() => {
    console.log('[TIPS] handleManualTip called', {
      usedTips,
      availableTips,
      hasActiveHint: !!activeHint,
      bankLength: bank.length,
      originalTokensLength: originalTokens.length,
      placedTokensSize: placedTokens.size,
    });

    // Check if tips are available
    if (usedTips >= availableTips) {
      console.log('[TIPS] No tips available - usedTips >= availableTips');
      showToast('No tips available!', 'error', 2000);
      return;
    }

    // Don't trigger if hint is already active
    if (activeHint) {
      console.log('[TIPS] Hint already active');
      showToast('Tip already showing! Dismiss or use it first.', 'info', 2000);
      return;
    }

    // Find the first empty slot and the correct word for it
    let firstEmptySlot = -1;
    for (let i = 0; i < originalTokens.length; i++) {
      if (!placedTokens.has(i)) {
        firstEmptySlot = i;
        break;
      }
    }
    
    console.log('[TIPS] First empty slot:', firstEmptySlot);
    
    if (firstEmptySlot === -1) {
      showToast('All slots are filled!', 'info', 2000);
      return;
    }

    const correctToken = originalTokens[firstEmptySlot];
    console.log('[TIPS] Looking for token:', { 
      text: correctToken.text, 
      norm: correctToken.norm,
      id: correctToken.id 
    });
    console.log('[TIPS] Bank contents:', bank.map(t => ({ id: t.id, text: t.text, norm: t.norm })));
    
    // Find the correct word in the bank - use exact ID match first, then fall back to norm match
    let correctWordInBank = bank.find(t => t.id === correctToken.id);
    if (!correctWordInBank) {
      // Fall back to norm matching for duplicate words
      correctWordInBank = bank.find(t => t.norm === correctToken.norm);
    }
    
    console.log('[TIPS] Found word in bank:', correctWordInBank ? { id: correctWordInBank.id, text: correctWordInBank.text } : 'NOT FOUND');
    
    if (correctWordInBank) {
      setIsFadingHint(false);
      setActiveHint({
        tokenId: correctWordInBank.id,
        slotPosition: firstEmptySlot,
      });
      setUsedTips((prev) => prev + 1);
      showToast('💡 Tip activated! Watch the highlighted word and slot.', 'success', 3000);
    } else {
      console.log('[TIPS] Could not find correct word in bank');
      showToast('Unable to find the correct word. Try placing more words!', 'error', 2000);
    }
  }, [usedTips, availableTips, activeHint, originalTokens, placedTokens, bank, showToast]);

  // Try to place a token on a specific slot
  // Returns true if placed successfully, false otherwise
  const tryPlaceTokenOnSlot = useCallback(
    (token: WordToken, slotPosition: number): boolean => {
      // Check if slot is already filled
      if (placedTokens.has(slotPosition)) {
        console.log('[PLACEMENT] Slot already filled:', { slotPosition });
        return false;
      }

      // Check if this token is correct for THIS specific slot
      const expectedToken = originalTokens[slotPosition];
      
      console.log('[PLACEMENT] Attempting placement:', {
        slotPosition,
        token: { id: token.id, text: token.text, norm: token.norm, position: token.position },
        expected: { id: expectedToken.id, text: expectedToken.text, norm: expectedToken.norm, position: expectedToken.position },
        normMatch: token.norm === expectedToken.norm,
        tokenNormBytes: [...token.norm].map(c => c.charCodeAt(0)),
        expectedNormBytes: [...expectedToken.norm].map(c => c.charCodeAt(0)),
      });
      
      if (token.norm !== expectedToken.norm) {
        // Wrong token for this slot - count as mistake
        console.log('[PLACEMENT] ❌ REJECTED - norm mismatch');
        registerMistake(token.id);
        return false;
      }

      // Correct! Place the token
      console.log('[PLACEMENT] ✅ ACCEPTED - placing token');
      setPlacedTokens((prev) => {
        const next = new Map(prev);
        next.set(slotPosition, token);
        return next;
      });

      setBank((prev) => prev.filter((t) => t.id !== token.id));
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
        console.log('[PLACEMENT] 🔊 Auto-playing word audio for position:', slotPosition);
        playWord(slotPosition);
      }
      
      return true;
    },
    [originalTokens, placedTokens, onWordCorrect, registerMistake, enableWordByWordAudio, playWord]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const token = bank.find((t) => t.id === event.active.id) || null;
      setActiveToken(token);
    },
    [bank]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveToken(null);

      // If not dropped on anything, just return (no mistake)
      if (!over || hasExceededMistakeLimit) return;

      const activeId = active.id as string;
      const token = bank.find((t) => t.id === activeId);
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
    [bank, hasExceededMistakeLimit, tryPlaceTokenOnSlot]
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  if (originalTokens.length === 0) {
    return (
      <div className="min-h-[150px] flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">No words available for this ayah.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isLoading && (
        <div className="w-full flex justify-center mb-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
        </div>
      )}
      
      {/* Compact header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${
            hasExceededMistakeLimit 
              ? 'bg-red-500/20 border-red-500/30' 
              : 'bg-[#1a1a1a] border-white/10'
          }`}>
            <span className={`text-xs font-medium ${hasExceededMistakeLimit ? 'text-red-400' : 'text-gray-400'}`}>
              Mistakes: {mistakeCount}/{MAX_MISTAKES}
            </span>
          </div>
          
          {/* Tips Counter - Clickable Button */}
          <motion.button
            onClick={handleManualTip}
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
          >
            <Lightbulb className={`w-3.5 h-3.5 ${usedTips >= availableTips ? 'text-gray-500' : 'text-green-400'}`} />
            <span className={`text-xs font-medium ${usedTips >= availableTips ? 'text-gray-500' : 'text-green-400'}`}>
              Tips: {usedTips}/{availableTips}
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
              <span className="text-xs font-medium">Dismiss</span>
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
          {placedTokens.size}/{originalTokens.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(placedTokens.size / originalTokens.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Audio Player - Compact version */}
      {surahNumber && ayahNumber && (
        <div className="mb-4 bg-white/[0.02] border border-white/5 rounded-xl p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              disabled={isLoadingAudio}
              className={`
                flex items-center justify-center w-9 h-9 rounded-full transition-all flex-shrink-0
                ${isPlayingRecitation 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
                }
                ${isLoadingAudio ? 'opacity-50' : ''}
              `}
            >
              {isLoadingAudio ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlayingRecitation ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            
            <div className="flex items-center gap-1.5 flex-1">
              <Volume2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">
                {isLoadingAudio ? 'Loading...' : isPlayingRecitation ? 'Playing recitation' : 'Listen to recitation'}
              </span>
            </div>
          </div>
          
          {audioError && (
            <p className="text-xs text-red-400 mt-1.5">{audioError}</p>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AnswerArea
          correctTokens={originalTokens}
          placedTokens={placedTokens}
          activeTokenId={activeToken?.id || null}
          isPlayingRecitation={isPlayingRecitation}
          hintedSlotPosition={activeHint?.slotPosition ?? null}
          isFadingHint={isFadingHint}
          showTransliteration={wordTransliterations.length > 0}
          enableWordAudio={enableWordByWordAudio}
          onWordClick={handleAnswerWordClick}
          playingWordIndex={currentWordIndex}
        />
        <WordBank
          bank={bank}
          shakingIds={shakingIds}
          hintedTokenId={activeHint?.tokenId ?? null}
          isFadingHint={isFadingHint}
          showTransliteration={wordTransliterations.length > 0}
        />

        <DragOverlay dropAnimation={dropAnimation}>
          {activeToken ? <DraggableWord token={activeToken} isOverlay /> : null}
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
