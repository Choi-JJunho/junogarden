export default function Loading() {
  return (
    <div className="min-h-screen">
      <header className="p-6 md:p-8 border-b-2 border-primary/20">
        <div className="max-w-4xl mx-auto">
          <div className="h-6 bg-primary/10 rounded w-24 animate-shimmer"></div>
        </div>
      </header>

      <main className="p-6 md:p-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="h-12 bg-primary/10 rounded w-3/4 mb-4 animate-shimmer"></div>

            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="h-4 bg-primary/10 rounded w-32 animate-shimmer"></div>
              <div className="h-4 bg-primary/10 rounded w-24 animate-shimmer"></div>
              <div className="h-4 bg-primary/10 rounded w-24 animate-shimmer"></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-primary/10 rounded-full w-20 animate-shimmer"></div>
              ))}
            </div>
          </header>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-4 bg-primary/10 rounded animate-shimmer"></div>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
