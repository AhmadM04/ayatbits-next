'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, X } from 'lucide-react';
import { getHarakatByCategory, type HarakatDefinition } from '@/lib/harakat-utils';

interface HarakatLegendProps {
  variant?: 'inline' | 'floating';
  onHarakatSelect?: (definition: HarakatDefinition) => void;
}

export default function HarakatLegend({ 
  variant = 'inline',
  onHarakatSelect 
}: HarakatLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categories = getHarakatByCategory();

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Help Button */}
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full 
                     bg-gradient-to-br from-purple-600 to-indigo-600 
                     shadow-lg shadow-purple-500/25 
                     flex items-center justify-center
                     hover:scale-105 transition-transform"
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 15 }}
        >
          <HelpCircle className="w-6 h-6 text-white" />
        </motion.button>

        {/* Floating Panel Modal */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setIsExpanded(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Panel */}
              <motion.div
                className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl 
                           w-full max-w-md max-h-[80vh] overflow-hidden"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
              >
                {/* Header */}
                <div className="sticky top-0 bg-[#0f0f0f] border-b border-white/5 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Harakat Guide
                    </h3>
                    <p className="text-sm text-gray-500">
                      Arabic diacritical marks
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  <LegendContent 
                    categories={categories} 
                    onSelect={(def) => {
                      onHarakatSelect?.(def);
                      setIsExpanded(false);
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inline collapsible variant
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between 
                   hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            Harakat Color Guide
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t border-white/5">
              <LegendContent 
                categories={categories}
                onSelect={onHarakatSelect}
                compact
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LegendContentProps {
  categories: ReturnType<typeof getHarakatByCategory>;
  onSelect?: (definition: HarakatDefinition) => void;
  compact?: boolean;
}

function LegendContent({ categories, onSelect, compact = false }: LegendContentProps) {
  return (
    <div className={compact ? 'pt-3 space-y-4' : 'space-y-6'}>
      {categories.map((category) => (
        <div key={category.name}>
          {/* Category Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">
              {category.name}
            </h4>
            <span className="text-xs text-gray-600 font-arabic" dir="rtl">
              {category.nameArabic}
            </span>
          </div>

          {/* Harakat Grid */}
          <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-3'}`}>
            {category.harakat.map((harakat) => (
              <button
                key={harakat.unicode}
                onClick={() => onSelect?.(harakat)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border border-white/5
                  hover:bg-white/5 transition-colors text-left
                  ${compact ? 'flex-col text-center' : ''}
                `}
              >
                {/* Harakat example */}
                <span 
                  className={`font-arabic ${compact ? 'text-2xl' : 'text-3xl'}`}
                  style={{ color: harakat.color }}
                  dir="rtl"
                >
                  {harakat.example}
                </span>

                {/* Label */}
                <div className={compact ? '' : 'flex-1 min-w-0'}>
                  <span 
                    className={`block font-medium ${compact ? 'text-xs' : 'text-sm'} truncate`}
                    style={{ color: harakat.color }}
                  >
                    {harakat.nameEnglish}
                  </span>
                  {!compact && (
                    <span className="text-xs text-gray-500 truncate block">
                      {harakat.sound}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Tip */}
      <p className="text-xs text-gray-600 pt-2 border-t border-white/5">
        Tap any harakat in the text to see its details
      </p>
    </div>
  );
}

