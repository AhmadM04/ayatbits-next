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
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Heart } from 'lucide-react';
import {
  tokenizeAyah,
  shuffleArray,
  validatePuzzleAnswer,
  isWordCorrectAtPosition,
  type WordToken,
} from '@/lib/puzzle-logic';
import { useToast } from '@/components/Toast';

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
  onClick,
}: {
  token: WordToken;
  isCorrect: boolean;
  isIncorrect: boolean;
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-xl cursor-grab active:cursor-grabbing transition-all
        ${isCorrect ? 'bg-green-500/20 border-2 border-green-500 text-green-400' : ''}
        ${isIncorrect ? 'bg-red-500/20 border-2 border-red-500 text-red-400' : ''}
        ${!isCorrect && !isIncorrect ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : ''}
        text-right font-medium text-lg font-arabic
      `}
    >
      {token.text}
    </div>
  );
}

function AnswerDroppable({
  answer,
  correctIds,
  incorrectIds,
  onWordClick,
}: {
  answer: WordToken[];
  correctIds: Set<string>;
  incorrectIds: Set<string>;
  onWordClick: (token: WordToken) => void;
}) {
  const { setNodeRef } = useDroppable({ id: 'answer-area' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[120px] bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-xl p-6 transition-colors"
    >
      {answer.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          Drag or click words from below to build the ayah
        </div>
      ) : (
        <SortableContext
          items={answer.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {answer.map((token) => (
              <SortableWord
                key={token.id}
                token={token}
                isCorrect={correctIds.has(token.id)}
                isIncorrect={incorrectIds.has(token.id)}
                onClick={() => onWordClick(token)}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

function DraggableWord({
  token,
  incorrectTokenId,
  onClick,
}: {
  token: WordToken;
  incorrectTokenId: string | null;
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
    transition: isDragging ? 'none' : 'opacity 0.2s',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-xl cursor-grab active:cursor-grabbing transition-all
        ${
          incorrectTokenId === token.id
            ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
            : 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
        }
        text-right font-medium text-lg font-arabic
      `}
    >
      {token.text}
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
  const { setNodeRef } = useDroppable({ id: 'word-bank' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[200px] bg-white/5 border-2 border-white/10 rounded-xl p-6 transition-colors"
    >
      <h4 className="text-lg font-semibold text-white mb-4">Word Bank</h4>
      {bank.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          All words used. Click words above to remove them.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {bank.map((token) => (
            <DraggableWord
              key={token.id}
              token={token}
              incorrectTokenId={incorrectTokenId}
              onClick={() => onWordClick(token)}
            />
          ))}
        </div>
      )}
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
}: WordPuzzleProps) {
  const { showToast } = useToast();
  const originalTokens = useMemo(() => tokenizeAyah(ayahText), [ayahText]);
  const [bank, setBank] = useState<WordToken[]>([]);
  const [answer, setAnswer] = useState<WordToken[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const [incorrectTokenId, setIncorrectTokenId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize on client side only to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setBank(shuffleArray(originalTokens));
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    setAnswer([]);
    setBank(shuffleArray(originalTokens));
    setMistakeCount(0);
    setHasExceededMistakeLimit(false);
    setIncorrectTokenId(null);
  }, [ayahText, originalTokens, isMounted]);

  // Calculate which words are correct at their current position
  const correctIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < answer.length; i += 1) {
      if (isWordCorrectAtPosition(answer[i], i, originalTokens)) {
        ids.add(answer[i].id);
      }
    }
    return ids;
  }, [answer, originalTokens]);

  // Calculate which words are incorrect (wrong word at position)
  const incorrectIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < answer.length; i += 1) {
      if (!isWordCorrectAtPosition(answer[i], i, originalTokens)) {
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
      showToast('Perfect! You completed the puzzle correctly.', 'success', 3000);
      setTimeout(() => {
        onSolved?.(true);
      }, 500);
    }
  }, [isComplete, onSolved, showToast]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeToken = [...bank, ...answer].find((t) => t.id === active.id);
    if (!activeToken) return;

    const isFromBank = bank.some((t) => t.id === active.id);
    const isToAnswer = over.id === 'answer-area' || answer.some((t) => t.id === over.id);
    const isToBank = over.id === 'word-bank' || bank.some((t) => t.id === over.id);

    if (isFromBank && isToAnswer) {
      // Determine insertion position
      let insertIndex = answer.length;
      if (over.id !== 'answer-area') {
        const overIndex = answer.findIndex((t) => t.id === over.id);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }
      moveFromBankToAnswer(activeToken, insertIndex);
    } else if (answer.some((t) => t.id === active.id) && isToBank) {
      moveFromAnswerToBank(activeToken);
    } else if (answer.some((t) => t.id === active.id) && answer.some((t) => t.id === over.id)) {
      // Reordering within answer
      const oldIndex = answer.findIndex((t) => t.id === active.id);
      const newIndex = answer.findIndex((t) => t.id === over.id);
      setAnswer(arrayMove(answer, oldIndex, newIndex));
    }
  };

  const moveFromBankToAnswer = (token: WordToken, position: number) => {
    if (hasExceededMistakeLimit) return;

    // Calculate what the new answer will be
    const newAnswer = [...answer];
    newAnswer.splice(position, 0, token);
    
    // Check if this word is correct at this position
    const isCorrect = isWordCorrectAtPosition(token, position, originalTokens);
    
    // Also check if all words before this position are correct
    let allBeforeCorrect = true;
    for (let i = 0; i < position; i++) {
      if (!isWordCorrectAtPosition(newAnswer[i], i, originalTokens)) {
        allBeforeCorrect = false;
        break;
      }
    }
    
    // Insert at position
    setAnswer(newAnswer);
    setBank((prev) => prev.filter((t) => t.id !== token.id));

    // Handle correctness after state update
    if (isCorrect && allBeforeCorrect) {
      onWordCorrect?.(position, token.text);
    } else {
      // Wrong word at this position OR words before are wrong - count as mistake
      handleMistake(token.id);
    }
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
    }, 1000);

    if (newMistakeCount >= 3 && !hasExceededMistakeLimit) {
      setHasExceededMistakeLimit(true);
      showToast('Too many mistakes! Redirecting to verse view...', 'error', 3000);
      setTimeout(() => {
        onMistakeLimitExceeded?.();
      }, 2000);
    } else if (newMistakeCount === 2) {
      showToast('Warning: One more mistake and you will be redirected!', 'warning', 2000);
    }
  };

  const handleWordClick = (token: WordToken, isInBank: boolean) => {
    if (hasExceededMistakeLimit) return;

    if (isInBank) {
      // Add to end of answer
      moveFromBankToAnswer(token, answer.length);
    } else {
      moveFromAnswerToBank(token);
    }
  };

  // Show loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Build the Ayah</h3>
          {onToggleLike && (
            <button
              onClick={onToggleLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? 'fill-red-400 text-red-400' : ''}`}
              />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Like Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Build the Ayah</h3>
        {onToggleLike && (
          <button
            onClick={onToggleLike}
            className={`p-2 rounded-lg transition-colors ${
              isLiked 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? 'fill-red-400 text-red-400' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Mistake Counter */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
          hasExceededMistakeLimit
            ? 'bg-red-500/10 border-2 border-red-500/30'
            : 'bg-white/5 border border-white/10'
        }`}
      >
        <span
          className={`font-semibold transition-colors ${
            hasExceededMistakeLimit ? 'text-red-400' : 'text-gray-300'
          }`}
        >
          {hasExceededMistakeLimit ? 'Too Many Mistakes!' : `Mistakes: ${mistakeCount}/3`}
        </span>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
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
        {isMounted && (
          <AnswerDroppable
            answer={answer}
            correctIds={correctIds}
            incorrectIds={incorrectIds}
            onWordClick={(token) => handleWordClick(token, false)}
          />
        )}

        {/* Word Bank */}
        {isMounted && (
          <WordBankDroppable
            bank={bank}
            incorrectTokenId={incorrectTokenId}
            onWordClick={(token) => handleWordClick(token, true)}
          />
        )}
      </DndContext>
    </div>
  );
}
