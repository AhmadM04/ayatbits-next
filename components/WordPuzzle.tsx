// components/WordPuzzle.tsx
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Heart, RefreshCw } from 'lucide-react';
import {
  tokenizeAyah,
  shuffleArray,
  isWordCorrectAtPosition,
  type WordToken,
} from '@/lib/puzzle-logic';
import { useToast } from '@/components/Toast';

// --- Types ---
interface WordPuzzleProps {
  ayahText: string;
  onSolved?: (isCorrect: boolean) => void;
  onWordCorrect?: (wordIndex: number, word: string) => void;
  onMistakeLimitExceeded?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

// --- Draggable Word (in Bank) ---
function DraggableWord({ 
  token, 
  isOverlay = false 
}: { 
  token: WordToken; 
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: token.id,
    data: { type: 'bank-item', token },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      dir="rtl"
      className={`
        touch-none relative
        px-5 py-3 rounded-2xl cursor-grab active:cursor-grabbing
        text-xl font-medium font-arabic text-center
        transition-all duration-200 select-none
        ${isDragging ? 'opacity-30' : 'opacity-100'}
        ${isOverlay 
          ? 'bg-[#1a1a1a] border-2 border-green-500 shadow-2xl shadow-green-500/20 text-white scale-110 z-50' 
          : 'bg-[#1a1a1a] border border-white/10 text-gray-200 hover:bg-[#222] hover:border-white/20 hover:scale-105 shadow-md'}
      `}
    >
      {token.text}
    </div>
  );
}

// --- Sortable Word (in Answer Area) ---
function SortableAnswerWord({
  token,
  isCorrect,
  isIncorrect,
  id,
}: {
  token: WordToken;
  isCorrect: boolean;
  isIncorrect: boolean;
  id: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      dir="rtl"
      className={`
        touch-none
        px-4 py-2 rounded-xl cursor-grab active:cursor-grabbing
        text-lg font-medium font-arabic text-center select-none
        transition-all duration-300
        ${isCorrect ? 'bg-green-500/20 border-2 border-green-500 text-green-400' : ''}
        ${isIncorrect ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-shake' : ''}
        ${!isCorrect && !isIncorrect ? 'bg-[#1a1a1a] border border-white/10 text-white' : ''}
      `}
    >
      {token.text}
    </div>
  );
}

// --- Answer Area (Drop Zone) ---
function AnswerArea({
  answer,
  correctIds,
  incorrectIds,
}: {
  answer: WordToken[];
  correctIds: Set<string>;
  incorrectIds: Set<string>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'answer-area' });

  return (
    <div
      ref={setNodeRef}
      dir="rtl"
      className={`
        min-h-[140px] w-full rounded-2xl border-2 border-dashed
        flex flex-wrap items-center justify-center content-center gap-3 p-6
        transition-all duration-300
        ${
          isOver
            ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
            : 'bg-[#0f0f0f] border-white/10'
        }
      `}
    >
      {answer.length === 0 && !isOver ? (
        <div className="text-center pointer-events-none">
          <p className="text-gray-500 text-sm font-medium">اسحب الكلمات هنا لبناء الآية</p>
        </div>
      ) : (
        <SortableContext items={answer.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          {answer.map((token) => (
            <SortableAnswerWord
              key={token.id}
              id={token.id}
              token={token}
              isCorrect={correctIds.has(token.id)}
              isIncorrect={incorrectIds.has(token.id)}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}

// --- Word Bank ---
function WordBank({ bank }: { bank: WordToken[] }) {
  const { setNodeRef } = useDroppable({ id: 'word-bank' });

  return (
    <div ref={setNodeRef} className="mt-8" dir="rtl">
      <div className="flex flex-wrap justify-center gap-3">
        {bank.map((token) => (
          <DraggableWord key={token.id} token={token} />
        ))}
      </div>
    </div>
  );
}

// --- Main Puzzle Component ---
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasExceededMistakeLimit, setHasExceededMistakeLimit] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Setup sensors (input methods)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialization
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
  }, [ayahText, originalTokens, isMounted]);

  // Validation Logic
  const { correctIds, incorrectIds, isComplete } = useMemo(() => {
    const corIds = new Set<string>();
    const incIds = new Set<string>();
    
    answer.forEach((token, index) => {
      if (isWordCorrectAtPosition(token, index, originalTokens)) {
        corIds.add(token.id);
      } else {
        incIds.add(token.id);
      }
    });

    const isDone = answer.length === originalTokens.length && incIds.size === 0;
    return { correctIds: corIds, incorrectIds: incIds, isComplete: isDone };
  }, [answer, originalTokens]);

  // Handle Completion
  useEffect(() => {
    if (isComplete) {
      showToast('ماشاء الله! Perfect!', 'success', 2000);
      const timer = setTimeout(() => {
        onSolved?.(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onSolved, showToast]);

  // Handle Drag Start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const token = 
      bank.find(t => t.id === active.id) || 
      answer.find(t => t.id === active.id);
    
    if (token) setActiveToken(token);
  }, [bank, answer]);

  // Handle Drag Over (allows cross-container movement)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isFromBank = bank.some(t => t.id === activeId);
    const isFromAnswer = answer.some(t => t.id === activeId);
    const isOverAnswerArea = overId === 'answer-area' || answer.some(t => t.id === overId);
    const isOverBank = overId === 'word-bank';

    // Bank -> Answer
    if (isFromBank && isOverAnswerArea) {
      const token = bank.find(t => t.id === activeId)!;
      let newIndex = answer.length;
      
      if (overId !== 'answer-area') {
        const overIndex = answer.findIndex(t => t.id === overId);
        if (overIndex !== -1) newIndex = overIndex;
      }

      setBank(prev => prev.filter(t => t.id !== activeId));
      setAnswer(prev => {
        const newAnswer = [...prev];
        newAnswer.splice(newIndex, 0, token);
        return newAnswer;
      });
    }
    // Answer -> Bank
    else if (isFromAnswer && isOverBank) {
      const token = answer.find(t => t.id === activeId)!;
      setAnswer(prev => prev.filter(t => t.id !== activeId));
      setBank(prev => [...prev, token]);
    }
  }, [bank, answer]);

  // Handle Drag End
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveToken(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Reorder within answer area
    if (answer.some(t => t.id === activeId) && answer.some(t => t.id === overId)) {
      const oldIndex = answer.findIndex(t => t.id === activeId);
      const newIndex = answer.findIndex(t => t.id === overId);
      
      if (oldIndex !== newIndex) {
        const newAnswer = arrayMove(answer, oldIndex, newIndex);
        setAnswer(newAnswer);
        validateMove(newAnswer[newIndex], newIndex);
      }
    }
  }, [answer]);

  const validateMove = useCallback((token: WordToken, index: number) => {
    if (hasExceededMistakeLimit) return;

    const isCorrect = isWordCorrectAtPosition(token, index, originalTokens);
    
    if (isCorrect) {
      onWordCorrect?.(index, token.text);
    } else {
      const newMistakes = mistakeCount + 1;
      setMistakeCount(newMistakes);
      
      if (newMistakes >= 3) {
        setHasExceededMistakeLimit(true);
        showToast('Too many mistakes! Redirecting...', 'error', 3000);
        setTimeout(() => onMistakeLimitExceeded?.(), 2000);
      }
    }
  }, [hasExceededMistakeLimit, mistakeCount, originalTokens, onWordCorrect, onMistakeLimitExceeded, showToast]);

  const handleReset = useCallback(() => {
    setAnswer([]);
    setBank(shuffleArray(originalTokens));
    setMistakeCount(0);
    setHasExceededMistakeLimit(false);
  }, [originalTokens]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4" dir="rtl">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center gap-2">
            <span className={`text-sm font-medium ${hasExceededMistakeLimit ? 'text-red-400' : 'text-gray-400'}`}>
              أخطاء
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < mistakeCount ? 'bg-red-500' : 'bg-white/10'
                  }`}
                />
              )
            )
            }
          </div>
        </div>
      </div>
      </div>
      </div>
  )
}

