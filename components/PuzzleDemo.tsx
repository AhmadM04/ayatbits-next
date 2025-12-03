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
import { motion } from 'framer-motion';
import {
  tokenizeAyah,
  shuffleArray,
  type WordToken,
} from '@/lib/puzzle-logic';

// Demo ayah text - a simple verse for demonstration
const DEMO_AYAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

function SortableWord({
  token,
  isCorrect,
  isRecentlyCorrect,
  onClick,
}: {
  token: WordToken;
  isCorrect: boolean;
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
          : {}
      }
      transition={{ duration: 0.3 }}
      className={`
        px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing
        ${isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-600 text-emerald-900 dark:text-emerald-100' : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]'}
        shadow-sm hover:shadow-md transition-all
        font-medium text-base
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
  const { setNodeRef } = useDroppable({ id: 'answer-area' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[100px] bg-emerald-50 dark:bg-emerald-950/30 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-4 transition-colors"
    >
      {answer.length === 0 ? (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
          Drag or click words from below
        </div>
      ) : (
        <SortableContext
          items={answer.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
            {answer.map((token) => (
              <SortableWord
                key={token.id}
                token={token}
                isCorrect={correctIds.has(token.id)}
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

function DraggableWord({
  token,
  onClick,
}: {
  token: WordToken;
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
    transition: isDragging ? 'none' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm hover:shadow-md font-medium text-base transition-all"
      dir="rtl"
    >
      {token.text}
    </div>
  );
}

function WordBankDroppable({
  bank,
  onWordClick,
}: {
  bank: WordToken[];
  onWordClick: (token: WordToken) => void;
}) {
  const { setNodeRef } = useDroppable({ id: 'word-bank' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[120px] bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl p-4 transition-colors"
    >
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Word Bank</h4>
      {bank.length === 0 ? (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
          All words used!
        </div>
      ) : (
        <div className="flex flex-wrap gap-2" dir="rtl">
          {bank.map((token) => (
            <DraggableWord
              key={token.id}
              token={token}
              onClick={() => onWordClick(token)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PuzzleDemo() {
  const originalTokens = useMemo(() => tokenizeAyah(DEMO_AYAH), []);
  const [bank, setBank] = useState<WordToken[]>(originalTokens);
  const [answer, setAnswer] = useState<WordToken[]>([]);
  const [recentlyCorrectId, setRecentlyCorrectId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setIsMounted(true);
    setAnswer([]);
    setBank(shuffleArray(originalTokens));
    setIsComplete(false);
    setRecentlyCorrectId(null);
  }, [originalTokens]);

  const correctIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < answer.length; i += 1) {
      if (answer[i].norm === originalTokens[i]?.norm) {
        ids.add(answer[i].id);
      }
    }
    return ids;
  }, [answer, originalTokens]);

  useEffect(() => {
    const complete =
      answer.length === originalTokens.length &&
      answer.every((t, i) => t.norm === originalTokens[i].norm);
    setIsComplete(complete);
  }, [answer, originalTokens]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeToken = [...bank, ...answer].find((t) => t.id === active.id);
    if (!activeToken) return;

    const isFromBank = bank.some((t) => t.id === active.id);
    const isFromAnswer = answer.some((t) => t.id === active.id);
    const isToAnswer = over.id === 'answer-area' || answer.some((t) => t.id === over.id);
    const isToBank = over.id === 'word-bank';

    if (isFromBank && isToAnswer) {
      moveFromBankToAnswer(activeToken);
    } else if (isFromAnswer && isToBank) {
      moveFromAnswerToBank(activeToken);
    } else if (isFromAnswer && isToAnswer) {
      const oldIndex = answer.findIndex((t) => t.id === active.id);
      const newIndex = answer.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setAnswer(arrayMove(answer, oldIndex, newIndex));
      }
    }
  };

  const moveFromBankToAnswer = (token: WordToken) => {
    const nextPosition = answer.length;
    const correctTokenForPosition = originalTokens[nextPosition];
    const isCorrect = correctTokenForPosition && token.norm === correctTokenForPosition.norm;

    if (!isCorrect) {
      return; // Don't add incorrect words in demo
    }

    setBank((prev) => prev.filter((t) => t.id !== token.id));
    setAnswer((prev) => {
      const next = [...prev, token];
      next.sort((a, b) => a.position - b.position);
      return next;
    });

    setRecentlyCorrectId(token.id);
    setTimeout(() => setRecentlyCorrectId(null), 500);
  };

  const moveFromAnswerToBank = (token: WordToken) => {
    setAnswer((prev) => prev.filter((t) => t.id !== token.id));
    setBank((prev) => [...prev, token]);
  };

  const handleWordClick = (token: WordToken, isInBank: boolean) => {
    if (isInBank) {
      moveFromBankToAnswer(token);
    } else {
      moveFromAnswerToBank(token);
    }
  };

  const handleReset = () => {
    setAnswer([]);
    setBank(shuffleArray(originalTokens));
    setIsComplete(false);
    setRecentlyCorrectId(null);
  };

  if (!isMounted) {
    return (
      <div className="bg-[var(--bg-card)] rounded-xl shadow-lg p-8 min-h-[400px] flex items-center justify-center transition-colors">
        <div className="text-[var(--text-muted)]">Loading demo...</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-xl shadow-lg p-6 md:p-8 border border-[var(--border-color)] transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">Try It Yourself</h3>
        <button
          onClick={handleReset}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Reset
        </button>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-lg text-center"
        >
          <p className="text-green-800 dark:text-green-200 font-semibold">✓ Perfect!</p>
        </motion.div>
      )}

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

        <div className="mt-4">
          <WordBankDroppable
            bank={bank}
            onWordClick={(token) => handleWordClick(token, true)}
          />
        </div>
      </DndContext>

      <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
        Demo: Drag words from the bank to reconstruct the verse. Click words to move them back.
      </p>
    </div>
  );
}

