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

          {/* Project cards skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-primary/10 rounded-xl p-6 animate-shimmer"
                style={{ minHeight: "240px" }}
              >
                <div className="h-8 bg-primary/20 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-primary/20 rounded w-24 mb-3"></div>
                <div className="h-4 bg-primary/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary/20 rounded w-5/6 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-primary/20 rounded-full w-16"></div>
                  <div className="h-6 bg-primary/20 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
