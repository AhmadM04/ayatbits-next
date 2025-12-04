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
import { Heart } from 'lucide-react';
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
        px-4 py-2 rounded-xl cursor-grab active:cursor-grabbing
        ${isCorrect ? 'bg-green-100 border-2 border-green-500' : ''}
        ${isIncorrect ? 'bg-red-100 border-2 border-red-500' : ''}
        ${!isCorrect && !isIncorrect ? 'bg-blue-50 border border-gray-200' : ''}
        shadow-sm hover:shadow-md transition-all
        text-right font-medium text-lg
      `}
    >
      {token.text}
    </motion.div>
  );
}

export default function WordPuzzle({
  ayahText,
  onSolved,
  onWordCorrect,
  onMistakeLimitExceeded,
  isLiked = false,
  onToggleLike,
}: WordPuzzleProps) {
  const originalTokens = useMemo(() => tokenizeAyah(ayahText), [ayahText]);
  const [bank, setBank] = useState<WordToken[]>(() => shuffleArray(originalTokens));
  const [answer, setAnswer] = useState<WordToken[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const [recentlyCorrectId, setRecentlyCorrectId] = useState<string | null>(null);
  const [incorrectTokenId, setIncorrectTokenId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
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

    if (!over || active.id === over.id) return;

    const activeToken = [...bank, ...answer].find((t) => t.id === active.id);
    if (!activeToken) return;

    // Check if dragging from bank to answer
    const isFromBank = bank.some((t) => t.id === active.id);
    const isToAnswer = answer.some((t) => t.id === over.id) || over.id === 'answer-area';

    if (isFromBank && (isToAnswer || over.id === 'answer-area')) {
      moveFromBankToAnswer(activeToken);
    } else if (answer.some((t) => t.id === active.id) && bank.some((t) => t.id === over.id)) {
      moveFromAnswerToBank(activeToken);
    } else if (answer.some((t) => t.id === active.id) && answer.some((t) => t.id === over.id)) {
      // Reordering within answer
      const oldIndex = answer.findIndex((t) => t.id === active.id);
      const newIndex = answer.findIndex((t) => t.id === over.id);
      setAnswer(arrayMove(answer, oldIndex, newIndex));
    }
  };

  const moveFromBankToAnswer = (token: WordToken) => {
    if (hasExceededMistakeLimit) return;

    const usedIds = new Set(answer.map((w) => w.id));
    const remainingTokens = originalTokens.filter((w) => !usedIds.has(w.id));
    const isValidToken = remainingTokens.some((w) => w.id === token.id);

    if (!isValidToken) {
      handleMistake(token.id);
      return;
    }

    setBank((prev) => prev.filter((t) => t.id !== token.id));
    setAnswer((prev) => {
      const next = [...prev, token];
      next.sort((a, b) => a.position - b.position);
      return next;
    });

    const wordIndex = answer.length;
    onWordCorrect?.(wordIndex, token.text);

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
    <div className="flex flex-col gap-6 p-6">
      {/* Header with Like Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Build the Ayah</h3>
        {onToggleLike && (
          <button
            onClick={onToggleLike}
            className="p-2 rounded-full hover:bg-red-50 transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        )}
      </div>

      {/* Mistake Counter */}
      <div
        className={`flex items-center justify-between p-4 rounded-lg ${
          hasExceededMistakeLimit
            ? 'bg-red-50 border-2 border-red-200'
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <span
          className={`font-semibold ${
            hasExceededMistakeLimit ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {hasExceededMistakeLimit ? 'Too Many Mistakes!' : `Mistakes: ${mistakeCount}/3`}
        </span>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= mistakeCount ? 'bg-red-500' : 'bg-gray-300'
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
        <div className="min-h-[120px] bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-6">
          {answer.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Drag or click words from below to build the ayah
            </div>
          ) : (
            <SortableContext
              items={answer.map((t) => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {answer.map((token, index) => (
                  <SortableWord
                    key={token.id}
                    token={token}
                    isCorrect={correctIds.has(token.id)}
                    isIncorrect={false}
                    isRecentlyCorrect={recentlyCorrectId === token.id}
                    onClick={() => handleWordClick(token, false)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Word Bank */}
        <div className="min-h-[200px] bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Word Bank</h4>
          {bank.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              All words used. Click words above to remove them.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {bank.map((token) => (
                <motion.div
                  key={token.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    incorrectTokenId === token.id
                      ? {
                          x: [0, -10, 10, -10, 10, 0],
                        }
                      : {}
                  }
                  onClick={() => handleWordClick(token, true)}
                  className={`
                    px-4 py-2 rounded-xl cursor-pointer
                    ${
                      incorrectTokenId === token.id
                        ? 'bg-red-100 border-2 border-red-500'
                        : 'bg-blue-50 border border-gray-200 hover:bg-blue-100'
                    }
                    shadow-sm hover:shadow-md transition-all
                    text-right font-medium text-lg
                  `}
                >
                  {token.text}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DndContext>

      {/* Success Animation */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Excellent!</h3>
              <p className="text-gray-600">You've completed this puzzle correctly!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

