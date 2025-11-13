"use client";

import { useState, useMemo } from "react";
import type { BlogPost } from "@/types";
import { Card } from "@/components/common/Card";
import { SearchInput } from "@/components/common/SearchInput";
import { TagFilter } from "@/components/common/TagFilter";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface BlogClientProps {
  allPosts: BlogPost[];
  allTags: string[];
}

export default function BlogClient({ allPosts, allTags }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Debounce search query to avoid excessive re-renders (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    // 태그 필터링
    if (selectedTag) {
      posts = posts.filter((post) => post.tags?.includes(selectedTag));
    }

    // 검색어 필터링 (use debounced value to improve performance)
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      posts = posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(lowerQuery) ||
          post.description?.toLowerCase().includes(lowerQuery) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      });
    }

    return posts;
  }, [allPosts, debouncedSearchQuery, selectedTag]);

  return (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      <TagFilter
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />

      {/* 결과 개수 */}
      {(searchQuery || selectedTag) && (
        <div className="mb-4 text-sm text-foreground/70" role="status" aria-live="polite">
          {filteredPosts.length}개의 글이 있습니다
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="bg-background/90 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-8 text-center hover:border-primary/40 transition-all duration-300">
          <p className="text-foreground/70">
            {searchQuery || selectedTag
              ? "검색 결과가 없습니다."
              : "아직 작성된 글이 없습니다."}
          </p>
          {!searchQuery && !selectedTag && (
            <p className="text-sm text-foreground/50 mt-2">
              content/blog 폴더에 마크다운 파일을 추가해보세요.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6" role="list">
          {filteredPosts.map((post, index) => (
            <div key={post.slug} role="listitem">
              <Card
                type="blog"
                title={post.title}
                description={post.description}
                href={`/blog/${post.slug}`}
                date={post.date}
                tags={post.tags}
                index={index}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
