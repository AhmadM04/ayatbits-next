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
}

export default function ArabicTextCard({
  surahNumber,
  ayahNumber,
  ayahText,
  puzzleId,
  isMemorized,
  isLiked,
}: ArabicTextCardProps) {
  const [isPlayingRecitation, setIsPlayingRecitation] = useState(false);

  return (
    <>
      {/* Arabic Text Card with icons on top right */}
      <div
        className={`
          bg-[#0f0f0f] border-2 rounded-xl p-4 sm:p-5
          transition-all duration-300
          ${isPlayingRecitation
            ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)] ring-2 ring-green-500/20'
            : 'border-white/10'
          }
        `}
      >
        {/* Top icons row - explicitly right aligned */}
        <div className="flex items-center gap-2 mb-3" style={{ justifyContent: 'flex-end' }}>
          {isMemorized && (
            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center" title="Memorized">
              <CheckCircle className="w-4 h-4 text-green-400" />
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

