export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="w-24 h-6 bg-white/10 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section Skeleton */}
        <div className="mb-6">
          <div className="w-48 h-8 bg-white/10 rounded animate-pulse mb-2" />
          <div className="w-64 h-4 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Daily Quote Skeleton */}
        <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="space-y-3">
            <div className="w-full h-6 bg-white/10 rounded animate-pulse" />
            <div className="w-3/4 h-6 bg-white/10 rounded animate-pulse" />
            <div className="w-1/2 h-4 bg-white/10 rounded animate-pulse mt-4" />
          </div>
        </div>

        {/* Juz Selector Skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
            <div className="w-32 h-6 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto bg-white/10 rounded animate-pulse mb-2" />
                  <div className="w-full h-3 bg-white/10 rounded animate-pulse mb-2" />
                  <div className="w-full h-1.5 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav Skeleton */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 px-4 py-2 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 py-2">
              <div className="w-6 h-6 bg-white/10 rounded animate-pulse" />
              <div className="w-10 h-3 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

