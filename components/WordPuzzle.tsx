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
  DragStartEvent,
  DragOverlay,
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
function DraggableWord({ token, isOverlay = false }: { token: WordToken; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: token.id,
    data: { type: 'bank-item', token },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
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
      className={`
        touch-none
        px-4 py-2 rounded-xl cursor-grab active:cursor-grabbing
        text-lg font-medium font-arabic text-center select-none
        transition-all duration-300
        ${isCorrect ? 'bg-green-500/20 border-2 border-green-500 text-green-400' : ''}
        ${isIncorrect ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse' : ''}
        ${!isCorrect && !isIncorrect ? 'bg-[#1a1a1a] border border-white/10 text-white' : ''}
      `}
    >
      {token.text}
    </div>
  );
}

// --- Components ---

// 1. The Answer Area (Drop Zone)
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
          <p className="text-gray-500 text-sm font-medium">Drag words here to build the verse</p>
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

// 2. The Word Bank
function WordBank({ bank }: { bank: WordToken[] }) {
  const { setNodeRef } = useDroppable({ id: 'word-bank' });

  return (
    <div ref={setNodeRef} className="mt-8">
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
        distance: 8, // Prevent accidental drags on tap
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
  }, []); // Run once on mount

  useEffect(() => {
    if (!isMounted) return;
    // Reset when verse changes
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
      showToast('Mashallah! Perfect!', 'success', 2000);
      const timer = setTimeout(() => {
        onSolved?.(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onSolved, showToast]);

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find the token data whether it's in bank or answer
    const token = 
      bank.find(t => t.id === active.id) || 
      answer.find(t => t.id === active.id);
      
    if (token) setActiveToken(token);
  };

  // Handle Drag End (The Core Logic)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveToken(null);

    // 1. Dropped outside any valid drop zone?
    if (!over) {
      // If it was in the answer area, remove it and put it back in bank
      if (answer.some(t => t.id === active.id)) {
        const token = answer.find(t => t.id === active.id)!;
        setAnswer(prev => prev.filter(t => t.id !== active.id));
        setBank(prev => [...prev, token]);
      }
      return; // Snap back happens automatically via dnd-kit visual
    }

    const activeTokenId = active.id as string;
    const isFromBank = bank.some(t => t.id === activeTokenId);
    const isFromAnswer = answer.some(t => t.id === activeTokenId);
    const isOverAnswerArea = over.id === 'answer-area' || answer.some(t => t.id === over.id);
    const isOverBank = over.id === 'word-bank';

    // A. Bank -> Answer Area
    if (isFromBank && isOverAnswerArea) {
      const token = bank.find(t => t.id === activeTokenId)!;
      
      // Determine insertion index
      let newIndex = answer.length;
      if (over.id !== 'answer-area') {
        const overIndex = answer.findIndex(t => t.id === over.id);
        if (overIndex !== -1) newIndex = overIndex;
      }

      const newAnswer = [...answer];
      newAnswer.splice(newIndex, 0, token);
      
      setAnswer(newAnswer);
      setBank(prev => prev.filter(t => t.id !== activeTokenId));
      
      validateMove(token, newIndex);
    }

    // B. Answer -> Bank (Removing word)
    else if (isFromAnswer && isOverBank) {
      const token = answer.find(t => t.id === activeTokenId)!;
      setAnswer(prev => prev.filter(t => t.id !== activeTokenId));
      setBank(prev => [...prev, token]);
    }

    // C. Reordering inside Answer Area
    else if (isFromAnswer && isOverAnswerArea && active.id !== over.id) {
      const oldIndex = answer.findIndex(t => t.id === active.id);
      const newIndex = answer.findIndex(t => t.id === over.id);
      
      const newAnswer = arrayMove(answer, oldIndex, newIndex);
      setAnswer(newAnswer);
      
      // Check validation for the moved item at new position
      validateMove(newAnswer[newIndex], newIndex);
    }
  };

  const validateMove = (token: WordToken, index: number) => {
    // Only check mistakes if we aren't already locked out
    if (hasExceededMistakeLimit) return;

    // Check if the word at this position matches the original text
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
      } else {
        // Optional: Shake effect or sound could trigger here
      }
    }
  };

  const handleReset = () => {
    setAnswer([]);
    setBank(shuffleArray(originalTokens));
    setMistakeCount(0);
    setHasExceededMistakeLimit(false);
  };

  // Drop animation config
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
    <div className="max-w-3xl mx-auto px-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center gap-2">
            <span className={`text-sm font-medium ${hasExceededMistakeLimit ? 'text-red-400' : 'text-gray-400'}`}>
              Mistakes
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < mistakeCount ? 'bg-red-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="p-2 rounded-full bg-[#1a1a1a] border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
            title="Reset Puzzle"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {onToggleLike && (
          <button
            onClick={onToggleLike}
            className={`
              p-2.5 rounded-xl transition-all duration-300
              ${isLiked 
                ? 'bg-red-500/10 text-red-500 border border-red-500/50' 
                : 'bg-[#1a1a1a] text-gray-400 border border-white/10 hover:border-white/30'}
            `}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* DND Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AnswerArea 
          answer={answer} 
          correctIds={correctIds} 
          incorrectIds={incorrectIds} 
        />
        
        <WordBank bank={bank} />

        {/* Floating Item Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeToken ? (
            <DraggableWord token={activeToken} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}