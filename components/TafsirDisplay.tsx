'use client';

import { BookText } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface TafsirDisplayProps {
  surahNumber: number;
  ayahNumber: number;
  tafsir: string | null;
  resource?: string;
  language?: string;
  isFallback?: boolean;
  isLoading?: boolean;
}

export default function TafsirDisplay({
  surahNumber,
  ayahNumber,
  tafsir,
  resource = 'Tafsir Ibn Kathir',
  language = 'English',
  isFallback = false,
  isLoading = false,
}: TafsirDisplayProps) {
  // Sanitize HTML content
  const sanitizedTafsir = tafsir ? DOMPurify.sanitize(tafsir) : '';

  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <BookText className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">
          {resource} - {language}
        </span>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-4/6" />
        </div>
      ) : tafsir ? (
        <>
          {isFallback && (
            <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
              ℹ️ Showing English tafsir (native tafsir not available in your language)
            </div>
          )}
          <div 
            className="text-gray-300 text-sm leading-relaxed prose prose-sm prose-invert max-w-none
              prose-p:my-2 prose-strong:text-white prose-strong:font-semibold
              prose-em:text-gray-300 prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: sanitizedTafsir }}
          />
        </>
      ) : (
        <p className="text-gray-500 text-sm">Tafsir not available</p>
      )}
    </div>
  );
}

