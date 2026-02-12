// ============================================================================
// PERFORMANCE OPTIMIZATION: Instant Loading UI
// ============================================================================
// Displays immediately while server fetches data in parallel
// Provides visual feedback and improves perceived performance
// ============================================================================

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo Skeleton */}
            <div className="h-9 w-36 bg-white/5 rounded animate-pulse" />
            
            {/* Desktop Navigation Skeleton */}
            <div className="hidden md:flex items-center gap-3">
              <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-8 w-12 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-white/5 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-white/5 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-white/5 rounded-full animate-pulse" />
            </div>

            {/* Mobile Menu Skeleton */}
            <div className="md:hidden">
              <div className="h-10 w-10 bg-white/5 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-64 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Daily Quote Skeleton */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
            </div>
            
            {/* Arabic Text Skeleton */}
            <div className="space-y-3 mb-4">
              <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-5/6 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-4/6 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Translation Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Audio Player Skeleton */}
            <div className="flex items-center gap-4 mt-4">
              <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
              <div className="flex-1 h-2 bg-white/5 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Juz Selector Skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          
          {/* Juz Grid Skeleton */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 30 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 animate-pulse"
                style={{
                  animationDelay: `${index * 0.03}s`,
                }}
              >
                <div className="text-center">
                  {/* Juz Number Skeleton */}
                  <div className="h-8 w-8 bg-white/10 rounded mx-auto mb-2" />
                  
                  {/* Juz Name Skeleton */}
                  <div className="h-3 w-16 bg-white/10 rounded mx-auto mb-2" />
                  
                  {/* Progress Bar Skeleton */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-1">
                    <div className="bg-white/10 h-1.5 rounded-full w-0" />
                  </div>
                  
                  {/* Progress Text Skeleton */}
                  <div className="h-2 w-10 bg-white/10 rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-16 px-4 max-w-2xl mx-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/10 rounded animate-pulse" />
              <div className="w-12 h-2 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
