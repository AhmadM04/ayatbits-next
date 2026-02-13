'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AyahSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzles: Array<{ _id: string; content: { ayahNumber?: number } }>;
  currentAyahNumber: number;
  juzNumber: number;
  surahNumber: number;
}

export default function AyahSelectorModal({
  isOpen,
  onClose,
  puzzles,
  currentAyahNumber,
  juzNumber,
  surahNumber,
}: AyahSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm('');
      setSelectedAyah(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const ayahNumbers = puzzles
    .map((p) => p.content.ayahNumber || 0)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  const minAyah = Math.min(...ayahNumbers);
  const maxAyah = Math.max(...ayahNumbers);

  // Validate search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const num = parseInt(value);
    if (!isNaN(num) && num >= minAyah && num <= maxAyah && ayahNumbers.includes(num)) {
      setSelectedAyah(num);
    } else {
      setSelectedAyah(null);
    }
  };

  const handleGo = () => {
    if (selectedAyah !== null) {
      // Close modal first to clean up state
      onClose();
      // Use replace to avoid adding to history stack
      router.replace(`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${selectedAyah}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedAyah !== null) {
      handleGo();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] dark:border-white/10">
          <h2 className="text-xl font-semibold text-[#4A3728] dark:text-white">Select Ayah</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#8E7F71] dark:text-gray-400" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E7F71] dark:text-gray-400" />
              <input
                ref={inputRef}
                type="number"
                placeholder={`Enter ayah number (${minAyah}-${maxAyah})`}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                min={minAyah}
                max={maxAyah}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] dark:focus:ring-green-500 focus:border-transparent text-lg text-[#4A3728] dark:text-white placeholder:text-[#8E7F71] dark:placeholder:text-gray-500"
              />
            </div>

            {searchTerm && (
              <div className="text-sm">
                {selectedAyah !== null ? (
                  <p className="text-[#059669] font-medium">Ayah found</p>
                ) : (
                  <p className="text-red-600">Ayah not found</p>
                )}
              </div>
            )}

            <button
              onClick={handleGo}
              disabled={selectedAyah === null}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold transition-colors
                ${
                  selectedAyah !== null
                    ? 'bg-[#059669] text-white hover:bg-emerald-700'
                    : 'bg-gray-100 text-[#8E7F71] cursor-not-allowed'
                }
              `}
            >
              Go to Ayah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

