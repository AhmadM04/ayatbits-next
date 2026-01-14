'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { tokenizeAyah, type WordToken } from '@/lib/puzzle-logic';

// Demo ayah text for the puzzle (Surah Al-Fatiha verse 1)
const DEMO_AYAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// Generate demo words using tokenization (ensures norm is included)
const DEMO_WORDS = tokenizeAyah(DEMO_AYAH);

// Draggable word button
function DraggableWord({ word, isActive }: { word: WordToken; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: word.id,
    data: { word },
  });

  return (
    <motion.button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white font-arabic text-lg hover:border-green-500/50 hover:bg-green-500/10 transition-colors cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {word.text}
    </motion.button>
  );
}

// Droppable slot
function DropSlot({ 
  index, 
  placedWord,
  isOver,
}: { 
  index: number; 
  placedWord: WordToken | null;
  isOver: boolean;
}) {
  const { setNodeRef, isOver: dropIsOver } = useDroppable({
    id: `slot-${index}`,
    data: { position: index },
  });

  const showHighlight = isOver || dropIsOver;

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[60px] h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
        placedWord
          ? 'border-green-500/50 bg-green-500/10'
          : showHighlight
          ? 'border-green-500 bg-green-500/20'
          : 'border-white/20 bg-white/5'
      }`}
    >
      {placedWord ? (
        <motion.span
          key={placedWord.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-lg font-arabic text-green-400 px-3"
        >
          {placedWord.text}
        </motion.span>
      ) : (
        <span className="text-xs text-gray-600">{index + 1}</span>
      )}
    </div>
  );
}

export default function DemoPuzzle() {
  const [placedWords, setPlacedWords] = useState<Map<number, WordToken>>(new Map());
  const [bankWords, setBankWords] = useState<WordToken[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [activeWord, setActiveWord] = useState<WordToken | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [shakingId, setShakingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Initialize with shuffled words
  useEffect(() => {
    resetPuzzle();
  }, []);

  // Check for completion
  useEffect(() => {
    if (placedWords.size === DEMO_WORDS.length) {
      setIsComplete(true);
    }
  }, [placedWords]);

  const resetPuzzle = () => {
    setPlacedWords(new Map());
    setIsComplete(false);
    setMistakeCount(0);
    // Shuffle words
    const shuffled = [...DEMO_WORDS].sort(() => Math.random() - 0.5);
    setBankWords(shuffled);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const word = event.active.data.current?.word as WordToken;
    setActiveWord(word);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveWord(null);

    if (!over) return;

    const word = active.data.current?.word as WordToken;
    const overId = over.id as string;

    if (overId.startsWith('slot-')) {
      const targetPosition = parseInt(overId.replace('slot-', ''));
      
      // Check if slot is already occupied
      if (placedWords.has(targetPosition)) {
        // Shake the word and return it
        setShakingId(word.id);
        setTimeout(() => setShakingId(null), 300);
        return;
      }

      // Check if the word is correct for this position (compare normalized text)
      const expectedWord = DEMO_WORDS[targetPosition];
      if (expectedWord && word.norm === expectedWord.norm) {
        // Correct placement - word matches expected word at this position
        setPlacedWords(prev => {
          const next = new Map(prev);
          next.set(targetPosition, word);
          return next;
        });
        setBankWords(prev => prev.filter(w => w.id !== word.id));
      } else {
        // Wrong placement - shake and count mistake
        setShakingId(word.id);
        setMistakeCount(prev => prev + 1);
        setTimeout(() => setShakingId(null), 300);
      }
    }
  };

  const handleWordClick = (word: WordToken) => {
    if (isComplete) return;

    // Find the first empty slot
    let targetPosition = -1;
    for (let i = 0; i < DEMO_WORDS.length; i++) {
      if (!placedWords.has(i)) {
        targetPosition = i;
        break;
      }
    }

    if (targetPosition === -1) return;

    // Check if correct (compare normalized text)
    const expectedWord = DEMO_WORDS[targetPosition];
    if (expectedWord && word.norm === expectedWord.norm) {
      setPlacedWords(prev => {
        const next = new Map(prev);
        next.set(targetPosition, word);
        return next;
      });
      setBankWords(prev => prev.filter(w => w.id !== word.id));
    } else {
      // Wrong placement
      setShakingId(word.id);
      setMistakeCount(prev => prev + 1);
      setTimeout(() => setShakingId(null), 300);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${
              mistakeCount >= 3 
                ? 'bg-red-500/20 border-red-500/30' 
                : 'bg-[#1a1a1a] border-white/10'
            }`}>
              <span className={`text-xs font-medium ${mistakeCount >= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                Mistakes: {mistakeCount}/3
              </span>
            </div>
            <button
              onClick={resetPuzzle}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-gray-500">
            {placedWords.size}/{DEMO_WORDS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-green-500"
            animate={{ width: `${(placedWords.size / DEMO_WORDS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Answer area */}
        <div
          dir="rtl"
          className="min-h-[80px] p-4 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] mb-4"
        >
          <div className="flex flex-wrap gap-2 justify-start">
            {Array.from({ length: DEMO_WORDS.length }).map((_, index) => (
              <DropSlot
                key={`slot-${index}`}
                index={index}
                placedWord={placedWords.get(index) || null}
                isOver={false}
              />
            ))}
          </div>

          <p className="text-gray-500 text-xs text-center mt-3">
            Drag words to their correct positions
          </p>
        </div>

        {/* Word bank */}
        <div className="flex flex-wrap gap-2 justify-center">
          <AnimatePresence>
            {bankWords.map((word) => (
              <motion.div
                key={word.id}
                animate={shakingId === word.id ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                onClick={() => handleWordClick(word)}
              >
                <DraggableWord word={word} isActive={activeWord?.id === word.id} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeWord ? (
            <div className="px-4 py-3 bg-green-600 border border-green-500 rounded-xl text-white font-arabic text-lg shadow-lg shadow-green-600/30 cursor-grabbing">
              {activeWord.text}
            </div>
          ) : null}
        </DragOverlay>

        {/* Complete message */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">MashaAllah! Perfect!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Too many mistakes */}
        <AnimatePresence>
          {mistakeCount >= 3 && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
            >
              <p className="text-red-400 text-sm mb-2">Too many mistakes!</p>
              <button
                onClick={resetPuzzle}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}
