'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-white/5 animate-pulse rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={{
            width: width || '100%',
            height: height || (variant === 'text' ? '1rem' : '100%'),
          }}
        />
      ))}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <LoadingSkeleton width={100} height={24} />
            <div className="flex items-center gap-3">
              <LoadingSkeleton width={80} height={32} variant="rectangular" />
              <LoadingSkeleton width={32} height={32} variant="circular" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <LoadingSkeleton width={200} height={24} className="mb-2" />
          <LoadingSkeleton width={300} height={16} />
        </div>

        {/* Daily Quote */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <LoadingSkeleton width={120} height={16} className="mb-4" />
          <LoadingSkeleton height={60} className="mb-4" />
          <div className="flex gap-2">
            <LoadingSkeleton width={100} height={36} />
            <LoadingSkeleton width={100} height={36} />
          </div>
        </div>

        {/* Juz Grid */}
        <div>
          <LoadingSkeleton width={150} height={20} className="mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <LoadingSkeleton width={40} height={40} variant="circular" className="mb-3" />
                <LoadingSkeleton width={60} height={16} className="mb-2" />
                <LoadingSkeleton width={80} height={12} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <LoadingSkeleton width={32} height={32} variant="circular" />
            <LoadingSkeleton width={80} height={20} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
          <LoadingSkeleton width={80} height={80} variant="circular" className="mx-auto mb-4" />
          <LoadingSkeleton width={150} height={24} className="mx-auto mb-2" />
          <LoadingSkeleton width={200} height={16} className="mx-auto" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <LoadingSkeleton width={40} height={40} variant="circular" className="mb-3" />
              <LoadingSkeleton width={60} height={12} className="mb-2" />
              <LoadingSkeleton width={80} height={24} />
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
              <LoadingSkeleton width={40} height={40} variant="circular" />
              <div className="flex-1">
                <LoadingSkeleton width={120} height={16} className="mb-1" />
                <LoadingSkeleton width={180} height={12} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function PuzzleSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <LoadingSkeleton width={32} height={32} variant="circular" />
            <LoadingSkeleton width={150} height={20} />
            <LoadingSkeleton width={32} height={32} variant="circular" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {/* Verse Box */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-6">
          <LoadingSkeleton height={80} className="mb-4" />
          <LoadingSkeleton height={40} />
        </div>

        {/* Drop Zone */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6 min-h-[120px]">
          <LoadingSkeleton width={150} height={16} className="mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} width={80} height={40} />
            ))}
          </div>
        </div>

        {/* Word Bank */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <LoadingSkeleton width={100} height={16} className="mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} width={70} height={40} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
      />
    </div>
  );
}









