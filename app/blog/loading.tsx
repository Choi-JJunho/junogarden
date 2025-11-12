export default function Loading() {
  return (
    <div className="min-h-screen">
      <header className="p-6 md:p-8 border-b-2 border-primary/20 backdrop-blur-sm bg-background/80">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-primary/10 rounded w-32 animate-shimmer"></div>
        </div>
      </header>

      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 bg-primary/10 rounded w-48 mb-8 animate-shimmer"></div>

          {/* Search bar skeleton */}
          <div className="h-12 bg-primary/10 rounded-xl w-full mb-6 animate-shimmer"></div>

          {/* Tag filter skeleton */}
          <div className="mb-8">
            <div className="h-4 bg-primary/10 rounded w-16 mb-3 animate-shimmer"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-primary/10 rounded-full w-20 animate-shimmer"></div>
              ))}
            </div>
          </div>

          {/* Post cards skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-primary/10 rounded-xl p-6 animate-shimmer"
                style={{ minHeight: "160px" }}
              >
                <div className="h-8 bg-primary/20 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-primary/20 rounded w-32 mb-3"></div>
                <div className="h-4 bg-primary/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary/20 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
