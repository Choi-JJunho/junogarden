"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "검색어를 입력하세요..."
}: SearchInputProps) {
  return (
    <div className="mb-6">
      <label htmlFor="search-input" className="sr-only">
        검색
      </label>
      <input
        id="search-input"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-background/90 backdrop-blur-sm border-2 border-primary/20 rounded-xl
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50
          transition-all duration-300 placeholder:text-foreground/40"
        aria-label="블로그 게시물 검색"
        role="searchbox"
      />
    </div>
  );
}
