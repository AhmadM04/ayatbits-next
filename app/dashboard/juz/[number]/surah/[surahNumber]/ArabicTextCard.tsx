'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import AyahTextDisplay from './AyahTextDisplay';
import LikeButton from './LikeButton';
import AudioPlayer from './AudioPlayer';

interface ArabicTextCardProps {
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  puzzleId: string;
  isMemorized: boolean;
  isLiked: boolean;
  enableWordByWordAudio?: boolean;
}

export default function ArabicTextCard({
  surahNumber,
  ayahNumber,
  ayahText,
  puzzleId,
  isMemorized,
  isLiked,
  enableWordByWordAudio,
}: ArabicTextCardProps) {
  const [isPlayingRecitation, setIsPlayingRecitation] = useState(false);

  return (
    <>
      {/* Arabic Text Card with icons on top right */}
      <div
        className={`
          bg-white border-2 rounded-xl p-4 sm:p-5 shadow-sm
          transition-all duration-300
          ${isPlayingRecitation
            ? 'border-[#059669]/50 shadow-[0_0_30px_rgba(5,150,105,0.3)] ring-2 ring-[#059669]/20'
            : 'border-[#E5E7EB]'
          }
        `}
      >
        {/* Top icons row - explicitly right aligned */}
        <div className="flex items-center gap-2 mb-3" style={{ justifyContent: 'flex-end' }}>
          {isMemorized && (
            <div className="w-7 h-7 rounded-full bg-emerald-50/50 flex items-center justify-center" title="Memorized">
              <CheckCircle className="w-4 h-4 text-[#059669]" />
            </div>
          )}
          <LikeButton
            puzzleId={puzzleId}
            isLiked={isLiked}
            compact
          />
        </div>

        {/* Arabic Text */}
        <AyahTextDisplay
          ayahText={ayahText}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          enableWordByWordAudio={enableWordByWordAudio}
        />
      </div>

      {/* Audio Player - Redesigned */}
      <AudioPlayer
        surahNumber={surahNumber}
        ayahNumber={ayahNumber}
        onPlayingChange={setIsPlayingRecitation}
      />
    </>
  );
}

