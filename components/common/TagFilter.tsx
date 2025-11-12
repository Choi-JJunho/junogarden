"use client";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground/70">태그:</span>
        {selectedTag && (
          <button
            onClick={() => onTagSelect(null)}
            className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded hover:bg-secondary/30 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-label="태그 필터 초기화"
          >
            필터 초기화
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="태그 필터">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              selectedTag === tag
                ? "bg-primary text-white shadow-md"
                : "bg-primary/10 text-foreground/70 hover:bg-primary/20"
            }`}
            aria-pressed={selectedTag === tag}
            aria-label={`${tag} 태그로 필터링`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
