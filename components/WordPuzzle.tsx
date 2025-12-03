'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import {
  tokenizeAyah,
  shuffleArray,
  validatePuzzleAnswer,
  type WordToken,
} from '@/lib/puzzle-logic';

interface WordPuzzleProps {
  ayahText: string;
  onSolved?: (isCorrect: boolean) => void;
  onWordCorrect?: (wordIndex: number, word: string) => void;
  onMistakeLimitExceeded?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  ayahViewUrl?: string | null;
}

function SortableWord({
  token,
  isCorrect,
  isIncorrect,
  isRecentlyCorrect,
  onClick,
}: {
  token: WordToken;
  isCorrect: boolean;
  isIncorrect: boolean;
  isRecentlyCorrect: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: token.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isRecentlyCorrect
          ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }
          : isIncorrect
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.3 }}
      className={`
        px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl cursor-grab active:cursor-grabbing
        ${isCorrect ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400' : ''}
        ${isIncorrect ? 'bg-red-500/20 border-2 border-red-500 text-red-400' : ''}
        ${!isCorrect && !isIncorrect ? 'bg-white/5 border border-white/20 text-white' : ''}
        shadow-sm hover:shadow-md transition-all
        font-medium text-sm sm:text-lg
      `}
      dir="rtl"
    >
      {token.text}
    </motion.div>
  );
}

function AnswerDroppable({
  answer,
  correctIds,
  recentlyCorrectId,
  onWordClick,
}: {
  answer: WordToken[];
  correctIds: Set<string>;
  recentlyCorrectId: string | null;
  onWordClick: (token: WordToken) => void;
}) {
  const { t } = useI18n();
  const { setNodeRef } = useDroppable({ id: 'answer-area' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[80px] sm:min-h-[120px] bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-xl p-3 sm:p-6"
    >
      {answer.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base text-center px-2">
          {t('puzzle.dragOrClickWords')}
        </div>
      ) : (
        <SortableContext
          items={answer.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center" dir="rtl">
            {answer.map((token, index) => (
              <SortableWord
                key={token.id}
                token={token}
                isCorrect={correctIds.has(token.id)}
                isIncorrect={false}
                isRecentlyCorrect={recentlyCorrectId === token.id}
                onClick={() => onWordClick(token)}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

function WordBankDroppable({
  bank,
  incorrectTokenId,
  onWordClick,
}: {
  bank: WordToken[];
  incorrectTokenId: string | null;
  onWordClick: (token: WordToken) => void;
}) {
  const { t } = useI18n();
  const { setNodeRef } = useDroppable({ id: 'word-bank' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[120px] sm:min-h-[200px] bg-white/[0.02] border border-white/10 rounded-xl p-3 sm:p-6"
    >
      <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('puzzle.wordBank')}</h4>
      {bank.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base text-center">
          All words used. Click words above to remove them.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-3" dir="rtl">
          {bank.map((token) => (
            <DraggableWord
              key={token.id}
              token={token}
              isIncorrect={incorrectTokenId === token.id}
              onClick={() => onWordClick(token)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraggableWord({
  token,
  isIncorrect,
  onClick,
}: {
  token: WordToken;
  isIncorrect: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: token.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? 'none' : undefined, // No transition during drag for better performance
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl cursor-grab active:cursor-grabbing
        ${
          isIncorrect
            ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
            : 'bg-white/5 border border-white/20 hover:bg-white/10 text-white'
        }
        shadow-sm hover:shadow-md
        font-medium text-sm sm:text-lg
        ${isDragging ? 'opacity-50' : 'transition-all'}
      `}
      dir="rtl"
    >
      {token.text}
    </div>
  );
}

export default function WordPuzzle({
  ayahText,
  onSolved,
  onWordCorrect,
  onMistakeLimitExceeded,
  isLiked = false,
  onToggleLike,
  ayahViewUrl,
}: WordPuzzleProps) {
  const { t } = useI18n();
  const router = useRouter();
  const originalTokens = useMemo(() => tokenizeAyah(ayahText), [ayahText]);
  // Initialize with original order to prevent hydration mismatch
  // Shuffle will happen in useEffect on client side only
  const [bank, setBank] = useState<WordToken[]>(originalTokens);
  const [answer, setAnswer] = useState<WordToken[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const [recentlyCorrectId, setRecentlyCorrectId] = useState<string | null>(null);
  const [incorrectTokenId, setIncorrectTokenId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Small distance to start drag quickly
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Only shuffle on client side after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setAnswer([]);
    setBank(shuffleArray(originalTokens));
    setMistakeCount(0);
    setHasExceededMistakeLimit(false);
    setRecentlyCorrectId(null);
    setIncorrectTokenId(null);
  }, [ayahText, originalTokens]);

  const correctIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < answer.length; i += 1) {
      if (answer[i].norm === originalTokens[i]?.norm) {
        ids.add(answer[i].id);
      }
    }
    return ids;
  }, [answer, originalTokens]);

  const isComplete = useMemo(() => {
    return (
      answer.length === originalTokens.length &&
      answer.every((t, i) => t.norm === originalTokens[i].norm)
    );
  }, [answer, originalTokens]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onSolved?.(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onSolved]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const activeToken = [...bank, ...answer].find((t) => t.id === active.id);
    if (!activeToken) return;

    // Check where the word came from (original position before drag)
    const isFromBank = bank.some((t) => t.id === active.id);
    const isFromAnswer = answer.some((t) => t.id === active.id);

    // If dropped on itself, do nothing
    if (active.id === over?.id) return;

    // If no valid drop target, ensure word stays in original position
    if (!over) {
      // Word was dropped outside any valid drop zone
      // If it was in the bank, it stays in bank (no action needed)
      // If it was in answer, it should stay in answer (no action needed)
      // dnd-kit will handle the visual reset automatically
      return;
    }

    // Check valid drop targets
    const isToAnswer = over.id === 'answer-area';
    const isToAnswerWord = answer.some((t) => t.id === over.id);
    const isToBank = over.id === 'word-bank' || bank.some((t) => t.id === over.id);

    if (isFromBank && (isToAnswer || isToAnswerWord)) {
      // Dragging from bank to answer area
      moveFromBankToAnswer(activeToken);
    } else if (isFromAnswer && isToBank) {
      // Moving from answer back to bank
      moveFromAnswerToBank(activeToken);
    } else if (isFromAnswer && (isToAnswerWord || isToAnswer)) {
      // Reordering within answer - allow free reordering
      const oldIndex = answer.findIndex((t) => t.id === active.id);
      const newIndex = answer.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setAnswer(arrayMove(answer, oldIndex, newIndex));
      }
    } else {
      // Dropped in invalid location (e.g., bank word dropped on another bank word)
      // Word stays in its original position - no state change needed
      // dnd-kit will handle the visual reset automatically
    }
  };

  const moveFromBankToAnswer = (token: WordToken) => {
    if (hasExceededMistakeLimit) return;

    // Get the next position where a word should be placed
    const nextPosition = answer.length;
    const correctTokenForPosition = originalTokens[nextPosition];

    // Check if the token is correct for this position
    const isCorrect = correctTokenForPosition && token.norm === correctTokenForPosition.norm;

    if (!isCorrect) {
      // Wrong word - count as mistake
      handleMistake(token.id);
      return;
    }

    // Correct word - add it to answer
    setBank((prev) => prev.filter((t) => t.id !== token.id));
    setAnswer((prev) => {
      const next = [...prev, token];
      // Sort by position to maintain correct order
      next.sort((a, b) => a.position - b.position);
      return next;
    });

    // Notify that a word was placed correctly
    onWordCorrect?.(nextPosition, token.text);

    setRecentlyCorrectId(token.id);
    setTimeout(() => setRecentlyCorrectId(null), 500);
  };

  const moveFromAnswerToBank = (token: WordToken) => {
    setAnswer((prev) => prev.filter((t) => t.id !== token.id));
    setBank((prev) => [...prev, token]);
  };

  const handleMistake = (tokenId: string) => {
    const newMistakeCount = mistakeCount + 1;
    setMistakeCount(newMistakeCount);
    setIncorrectTokenId(tokenId);

    setTimeout(() => {
      setIncorrectTokenId(null);
    }, 600);

    if (newMistakeCount >= 3 && !hasExceededMistakeLimit) {
      setHasExceededMistakeLimit(true);
      setTimeout(() => onMistakeLimitExceeded?.(), 1000);
    }
  };

  const handleWordClick = (token: WordToken, isInBank: boolean) => {
    if (hasExceededMistakeLimit) return;

    if (isInBank) {
      moveFromBankToAnswer(token);
    } else {
      moveFromAnswerToBank(token);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-6">
      {/* Header with Like Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-white">{t('puzzle.buildTheAyah')}</h3>
        {onToggleLike && (
          <button
            onClick={onToggleLike}
            className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
          >
            <Heart
              className={`w-5 sm:w-6 h-5 sm:h-6 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        )}
      </div>

      {/* Mistake Counter */}
      <div
        className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
          hasExceededMistakeLimit
            ? 'bg-red-500/20 border-2 border-red-500/50'
            : 'bg-white/[0.02] border border-white/10'
        }`}
      >
        <span
          className={`font-semibold text-sm sm:text-base ${
            hasExceededMistakeLimit ? 'text-red-400' : 'text-white'
          }`}
        >
          {hasExceededMistakeLimit ? t('puzzle.mistake') + '!' : t('puzzle.mistakes', { count: mistakeCount }) + '/3'}
        </span>
        <div className="flex gap-1.5 sm:gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${
                i <= mistakeCount ? 'bg-red-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Answer Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <AnswerDroppable
          answer={answer}
          correctIds={correctIds}
          recentlyCorrectId={recentlyCorrectId}
          onWordClick={(token) => handleWordClick(token, false)}
        />

        {/* Word Bank */}
        <WordBankDroppable
          bank={bank}
          incorrectTokenId={incorrectTokenId}
          onWordClick={(token) => handleWordClick(token, true)}
        />
      </DndContext>

      {/* Mistake Limit Exceeded Modal */}
      <AnimatePresence>
        {hasExceededMistakeLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-red-500/20 border-b border-red-500/20 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <X className="w-5 sm:w-6 h-5 sm:h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-red-400">{t('puzzle.tooManyMistakes')}</h3>
                      <p className="text-xs sm:text-sm text-red-400/70">{t('puzzle.mistakeLimitReached')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {t('puzzle.reviewAyahMessage')}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {ayahViewUrl ? (
                    <Link
                      href={ayahViewUrl}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <BookOpen className="w-4 sm:w-5 h-4 sm:h-5" />
                      {t('puzzle.goBackToAyahView')}
                    </Link>
                  ) : (
                    <button
                      onClick={() => router.back()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <BookOpen className="w-4 sm:w-5 h-4 sm:h-5" />
                      {t('puzzle.goBack')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

