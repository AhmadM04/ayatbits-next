export default function MushafLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Page Info Badge Skeleton */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-6 bg-white/5 rounded-full animate-pulse" />
          <div className="w-16 h-6 bg-white/5 rounded-full animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          {/* Surah Header Skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-16 bg-white/5 rounded-xl animate-pulse" />
          </div>

          {/* Text Lines Skeleton */}
          <div className="space-y-4" dir="rtl">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-end">
                <div 
                  className="h-8 bg-white/5 rounded animate-pulse" 
                  style={{ width: `${Math.random() * 30 + 70}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hint Skeleton */}
        <div className="mt-6 flex justify-center">
          <div className="w-64 h-4 bg-white/5 rounded animate-pulse" />
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-20 h-10 bg-white/5 rounded-lg animate-pulse" />
            <div className="w-16 h-6 bg-white/5 rounded animate-pulse" />
            <div className="w-20 h-10 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

