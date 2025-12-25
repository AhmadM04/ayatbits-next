'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { useToast } from '@/components/Toast';

interface LikeButtonProps {
  puzzleId: string;
  isLiked: boolean;
  compact?: boolean;
}

export default function LikeButton({ puzzleId, isLiked: initialIsLiked, compact = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleToggleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        await apiDelete(`/api/puzzles/${puzzleId}/like`);
      } else {
        await apiPost(`/api/puzzles/${puzzleId}/like`);
      }
      setIsLiked(!isLiked);
      showToast(isLiked ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      if (error instanceof NetworkError) {
        showToast('Network error. Please check your connection.', 'error');
      } else {
        showToast(getErrorMessage(error), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`
          w-7 h-7 rounded-full flex items-center justify-center transition-all
          ${isLiked
            ? 'bg-red-500/20 text-red-400'
            : 'bg-white/5 text-gray-400 hover:text-red-400'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all
        ${isLiked
          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-red-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-medium">
        {isLiked ? 'Liked' : 'Like'}
      </span>
    </button>
  );
}
