// ============================================================================
// NATIVE LOADING EXPERIENCE - Replaces Yellow Progress Bar
// ============================================================================
// Displays immediately while server fetches data in parallel
// Theme-aware emerald spinner with proper background colors
// Hides the default Next.js yellow progress bar (see globals.css)
// ============================================================================

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#4A3728] dark:text-white pb-20">
      {/* Centered Loading Spinner - Replaces Yellow Bar */}
      <div className="fixed inset-0 flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0a0a0a] z-50">
        <div className="flex flex-col items-center gap-4">
          {/* Emerald Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-emerald-200 dark:border-emerald-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          {/* Optional Loading Text */}
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>

      {/* Original Skeleton UI (kept as backup) */}
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo Skeleton */}
            <div className="h-9 w-36 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            
            {/* Desktop Navigation Skeleton */}
            <div className="hidden md:flex items-center gap-3">
              <div className="h-10 w-48 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="h-8 w-12 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
            </div>

            {/* Mobile Menu Skeleton */}
            <div className="md:hidden">
              <div className="h-10 w-10 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>

        {/* Daily Quote Skeleton */}
        <div className="mb-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-emerald-100 dark:bg-green-500/20 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
            
            {/* Arabic Text Skeleton */}
            <div className="space-y-3 mb-4">
              <div className="h-12 w-full bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-5/6 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-4/6 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
            </div>

            {/* Translation Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
            </div>

            {/* Audio Player Skeleton */}
            <div className="flex items-center gap-4 mt-4">
              <div className="h-10 w-10 bg-emerald-100 dark:bg-green-500/20 rounded-full animate-pulse" />
              <div className="flex-1 h-2 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Juz Selector Skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-emerald-100 dark:bg-green-500/20 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
          
          {/* Juz Grid Skeleton */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 30 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl p-4 animate-pulse"
                style={{
                  animationDelay: `${index * 0.03}s`,
                }}
              >
                <div className="text-center">
                  {/* Juz Number Skeleton */}
                  <div className="h-8 w-8 bg-emerald-100 dark:bg-green-500/20 rounded mx-auto mb-2" />
                  
                  {/* Juz Name Skeleton */}
                  <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded mx-auto mb-2" />
                  
                  {/* Progress Bar Skeleton */}
                  <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 mb-1">
                    <div className="bg-emerald-200 dark:bg-green-500/30 h-1.5 rounded-full w-1/3" />
                  </div>
                  
                  {/* Progress Text Skeleton */}
                  <div className="h-2 w-10 bg-gray-200 dark:bg-white/10 rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-white/10 pb-safe">
        <div className="flex items-center justify-around h-16 px-4 max-w-2xl mx-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="w-12 h-2 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
