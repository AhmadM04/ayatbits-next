// components/WordPuzzle.tsx
'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  shuffleArray,
  tokenizeAyah,
  type WordToken,
} from '@/lib/puzzle-logic';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WordPuzzleProps {
  ayahText: string;
  onSolved?: (isCorrect: boolean) => void;
  onWordCorrect?: (wordIndex: number, word: string) => void;
  onMistakeLimitExceeded?: () => void;
}

const MAX_MISTAKES = 3;

// Droppable slot for the answer area
function DropSlot({
  position,
  expectedToken,
  placedToken,
  isActive,
}: {
  position: number;
  expectedToken: WordToken;
  placedToken: WordToken | null;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${position}`,
    data: { type: 'slot', position, expectedToken },
  });

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: position * 0.02, duration: 0.15 }}
      className={`
        min-w-[50px] min-h-[44px] px-3 py-2 rounded-lg
        flex items-center justify-center
        transition-all duration-150
        ${placedToken 
          ? 'bg-green-500/20 border-2 border-green-500' 
          : isOver && isActive
            ? 'bg-green-500/30 border-2 border-green-400 scale-105'
            : 'bg-[#1a1a1a]/50 border-2 border-dashed border-white/20'
        }
      `}
    >
      {placedToken ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-base font-medium font-arabic text-green-400 flex items-center gap-1"
        >
          {placedToken.text}
          <CheckCircle2 className="w-3 h-3 text-green-400 hidden sm:block" />
        </motion.span>
      ) : (
        <span className="text-gray-600 text-xs">
          {isOver && isActive ? '✓' : (position + 1)}
        </span>
      )}
    </motion.div>
  );
}

function DraggableWord({
  token,
  isOverlay = false,
  isShaking = false,
  onClick,
}: {
  token: WordToken;
  isOverlay?: boolean;
  isShaking?: boolean;
  onClick?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: token.id,
    data: { type: 'bank-item', token },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && onClick) {
      onClick(token.id);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      animate={isShaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={`
        relative cursor-pointer
        px-4 py-2.5 rounded-xl
        text-lg font-medium font-arabic text-center
        transition-all duration-150 select-none
        ${isDragging ? 'opacity-40' : 'opacity-100'}
        ${
          isOverlay
            ? 'bg-[#1a1a1a] border-2 border-green-500 shadow-xl text-white scale-105 z-50'
            : 'bg-[#1a1a1a] border border-white/10 text-gray-200 hover:bg-[#222] hover:border-white/20 active:scale-95'
        }
      `}
    >
      {token.text}
    </motion.div>
  );
}

function AnswerArea({
  correctTokens,
  placedTokens,
  activeTokenId,
}: {
  correctTokens: WordToken[];
  placedTokens: Map<number, WordToken>;
  activeTokenId: string | null;
}) {
  return (
    <div
      dir="rtl"
      className="min-h-[80px] w-full rounded-xl border-2 border-dashed border-white/10 bg-[#0f0f0f] p-3"
    >
      <div className="flex flex-wrap items-center gap-2" style={{ justifyContent: 'flex-start' }}>
        {correctTokens.map((token, index) => (
          <DropSlot
            key={`slot-${index}`}
            position={index}
            expectedToken={token}
            placedToken={placedTokens.get(index) || null}
            isActive={activeTokenId !== null}
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
  onSelect,
}: {
  bank: WordToken[];
  shakingIds: Set<string>;
  onSelect?: (id: string) => void;
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
                onClick={onSelect}
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
  onSolved,
  onWordCorrect,
  onMistakeLimitExceeded,
}: WordPuzzleProps) {
  const { showToast } = useToast();
  const originalTokens = useMemo(() => tokenizeAyah(ayahText), [ayahText]);

  const [bank, setBank] = useState<WordToken[]>([]);
  const [placedTokens, setPlacedTokens] = useState<Map<number, WordToken>>(new Map());
  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shakingIds, setShakingIds] = useState<Set<string>>(new Set());
  
  const pendingToast = useRef<{ message: string; type: 'success' | 'error'; duration: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
    setTimeout(() => setIsLoading(false), 0);
  }, [originalTokens]);

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
      setHasCompleted(true);
      setTimeout(() => {
        showToast('Masha Allah! Perfect!', 'success', 2000);
      }, 0);
      const timer = setTimeout(() => onSolved?.(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasCompleted, onSolved, showToast]);

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
  }, [onMistakeLimitExceeded, showToast]);

  // Try to place a token on a specific slot
  // Returns true if placed successfully, false otherwise
  const tryPlaceTokenOnSlot = useCallback(
    (token: WordToken, slotPosition: number): boolean => {
      // Check if slot is already filled
      if (placedTokens.has(slotPosition)) {
        return false;
      }

      // Check if this token is correct for THIS specific slot
      const expectedToken = originalTokens[slotPosition];
      if (token.norm !== expectedToken.norm) {
        // Wrong token for this slot - count as mistake
        registerMistake(token.id);
        return false;
      }

      // Correct! Place the token
      setPlacedTokens((prev) => {
        const next = new Map(prev);
        next.set(slotPosition, token);
        return next;
      });

      setBank((prev) => prev.filter((t) => t.id !== token.id));
      onWordCorrect?.(slotPosition, token.text);
      
      return true;
    },
    [originalTokens, placedTokens, onWordCorrect, registerMistake]
  );

  // For click: find first empty slot and try to place there
  const handleBankClick = useCallback(
    (id: string) => {
      const token = bank.find((t) => t.id === id);
      if (!token || hasExceededMistakeLimit) return;

      // Find first empty slot
      let firstEmptySlot = -1;
      for (let i = 0; i < originalTokens.length; i++) {
        if (!placedTokens.has(i)) {
          firstEmptySlot = i;
          break;
        }
      }

      if (firstEmptySlot === -1) return;

      tryPlaceTokenOnSlot(token, firstEmptySlot);
    },
    [bank, hasExceededMistakeLimit, originalTokens.length, placedTokens, tryPlaceTokenOnSlot]
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
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${
            hasExceededMistakeLimit 
              ? 'bg-red-500/20 border-red-500/30' 
              : 'bg-[#1a1a1a] border-white/10'
          }`}>
            <span className={`text-xs font-medium ${hasExceededMistakeLimit ? 'text-red-400' : 'text-gray-400'}`}>
              Mistakes: {mistakeCount}/{MAX_MISTAKES}
            </span>
          </div>
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AnswerArea
          correctTokens={originalTokens}
          placedTokens={placedTokens}
          activeTokenId={activeToken?.id || null}
        />
        <WordBank
          bank={bank}
          shakingIds={shakingIds}
          onSelect={handleBankClick}
        />

        <DragOverlay dropAnimation={dropAnimation}>
          {activeToken ? <DraggableWord token={activeToken} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
