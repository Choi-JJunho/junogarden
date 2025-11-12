# 리팩터링 계획 (Refactoring Plan)

이 문서는 junogarden-web 프로젝트의 개선 및 리팩터링 작업을 우선순위별로 정리한 것입니다.

## 🔴 높은 우선순위 (High Priority)

### 1. 메타데이터 및 SEO 최적화

**현재 문제점:**
- `app/layout.tsx`의 메타데이터가 기본 값("Create Next App")으로 되어 있음
- 개별 블로그/프로젝트 페이지에 동적 메타데이터 없음
- Open Graph 이미지, Twitter 카드 등 소셜 미디어 최적화 부재

**개선 방안:**
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'junogarden',
    template: '%s | junogarden'
  },
  description: '개인 프로젝트와 생각을 기록하는 실험 공간',
  openGraph: {
    title: 'junogarden',
    description: '개인 프로젝트와 생각을 기록하는 실험 공간',
    url: 'https://junogarden.com',
    siteName: 'junogarden',
    locale: 'ko_KR',
    type: 'website',
  }
}

// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    }
  }
}
```

**파일:**
- `app/layout.tsx`
- `app/blog/[slug]/page.tsx`
- `app/projects/[slug]/page.tsx`

---

### 2. 에러 처리 개선

**현재 문제점:**
- MDX 렌더링 실패 시 에러 처리 없음
- 파일 읽기 실패 시 로깅만 하고 사용자에게 피드백 없음
- 네트워크 에러 등에 대한 대비 없음

**개선 방안:**
```typescript
// app/blog/[slug]/error.tsx (신규 생성)
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">
          글을 불러오는데 실패했습니다
        </h2>
        <button onClick={reset} className="px-4 py-2 bg-primary text-white rounded-lg">
          다시 시도
        </button>
      </div>
    </div>
  )
}

// lib/blog.ts - 개선된 에러 처리
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const fullPath = path.join(blogDirectory, `${decodedSlug}.md`);

    if (!fs.existsSync(fullPath)) {
      console.warn(`Blog post not found: ${fullPath}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // 필수 필드 검증
    if (!data.title || !content) {
      console.error(`Invalid blog post format: ${fullPath}`);
      return null;
    }

    return {
      slug,
      fileName: decodedSlug,
      title: data.title,
      date: data.date || "",
      description: data.description || "",
      content,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}
```

**파일:**
- `app/blog/[slug]/error.tsx` (신규)
- `app/projects/[slug]/error.tsx` (신규)
- `app/error.tsx` (신규 - 전역 에러 처리)
- `lib/blog.ts`
- `lib/projects.ts`

---

### 3. 로딩 상태 개선

**현재 문제점:**
- 페이지 전환 시 로딩 UI 없음
- 컨텐츠 로딩 시 빈 화면 표시

**개선 방안:**
```typescript
// app/blog/loading.tsx (신규 생성)
export default function Loading() {
  return (
    <div className="min-h-screen">
      <header className="p-6 md:p-8 border-b-2 border-primary/20 animate-pulse">
        <div className="max-w-4xl mx-auto h-8 bg-primary/10 rounded w-32"></div>
      </header>
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 bg-primary/10 rounded w-48 mb-8 animate-pulse"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-primary/10 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// app/blog/[slug]/loading.tsx (신규 생성)
export default function Loading() {
  return (
    <div className="min-h-screen">
      <header className="p-6 md:p-8 border-b-2 border-primary/20 animate-pulse">
        <div className="max-w-4xl mx-auto h-6 bg-primary/10 rounded w-24"></div>
      </header>
      <main className="p-6 md:p-8">
        <article className="max-w-4xl mx-auto">
          <div className="h-12 bg-primary/10 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="h-4 bg-primary/10 rounded w-32 mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-primary/10 rounded animate-pulse"></div>
            ))}
          </div>
        </article>
      </main>
    </div>
  )
}
```

**파일:**
- `app/blog/loading.tsx` (신규)
- `app/blog/[slug]/loading.tsx` (신규)
- `app/projects/loading.tsx` (신규)
- `app/projects/[slug]/loading.tsx` (신규)

---

### 4. TypeScript 타입 안정성 강화

**현재 문제점:**
- 일부 타입이 느슨하게 정의됨
- 공통 타입이 여러 파일에 중복 정의됨

**개선 방안:**
```typescript
// types/index.ts (신규 생성)
export interface Frontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

export interface BlogFrontmatter extends Frontmatter {
  // 블로그 특화 필드
}

export interface ProjectFrontmatter extends Frontmatter {
  link?: string;
  github?: string;
}

export interface ContentItem {
  slug: string;
  content: string;
}

export interface BlogPost extends ContentItem {
  fileName: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

export interface Project extends ContentItem {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  link?: string;
  github?: string;
}

// components/common 폴더 생성 및 공통 컴포넌트 타입 정의
export interface CardProps {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  tags?: string[];
  date?: string;
}

export interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  external?: boolean;
}
```

**파일:**
- `types/index.ts` (신규)
- `lib/blog.ts` (import 타입 사용)
- `lib/projects.ts` (import 타입 사용)
- 모든 컴포넌트 파일들

---

## 🟡 중간 우선순위 (Medium Priority)

### 5. 공통 컴포넌트 추출

**현재 문제점:**
- 카드 레이아웃이 여러 곳에 반복됨
- 링크 스타일이 중복됨
- 헤더/푸터 레이아웃 재사용 안됨

**개선 방안:**
```typescript
// components/common/Card.tsx (신규)
interface CardProps {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  tags?: string[];
  date?: string;
  index?: number;
}

export function Card({ title, description, href, icon, tags, date, index = 0 }: CardProps) {
  return (
    <Link href={href}>
      <article
        className="group relative bg-background/90 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-6 hover:border-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-transparent transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'fadeInUp 0.5s ease-out forwards',
        }}
      >
        {/* 카드 내용 */}
      </article>
    </Link>
  )
}

// components/common/Header.tsx (신규)
interface HeaderProps {
  backLink?: string;
  backLabel?: string;
}

export function Header({ backLink = '/', backLabel = 'junogarden' }: HeaderProps) {
  return (
    <header className="p-6 md:p-8 border-b-2 border-primary/20 backdrop-blur-sm bg-background/80">
      <div className="max-w-4xl mx-auto">
        <Link
          href={backLink}
          className="text-primary hover:text-secondary transition-all duration-300 inline-flex items-center gap-2 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span>{backLabel}</span>
        </Link>
      </div>
    </header>
  )
}

// components/common/PageLayout.tsx (신규)
export function PageLayout({
  children,
  showBackground = false
}: {
  children: React.ReactNode;
  showBackground?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {showBackground && <InteractiveBackground />}
      {children}
    </div>
  )
}
```

**파일:**
- `components/common/Card.tsx` (신규)
- `components/common/Header.tsx` (신규)
- `components/common/PageLayout.tsx` (신규)
- `components/common/TagList.tsx` (신규)
- 모든 페이지 파일들 (리팩터링)

---

### 6. 이미지 최적화

**현재 문제점:**
- Next.js Image 컴포넌트 미사용
- 이미지 lazy loading 없음
- 반응형 이미지 최적화 없음

**개선 방안:**
```typescript
// MDX 컴포넌트 커스터마이징
// components/mdx/Image.tsx (신규)
import Image from 'next/image'

interface CustomImageProps {
  src: string;
  alt: string;
}

export function CustomImage({ src, alt }: CustomImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className="rounded-lg border-2 border-primary/20"
      loading="lazy"
    />
  )
}

// app/blog/[slug]/page.tsx
const mdxComponents = {
  img: CustomImage,
  // 다른 커스텀 컴포넌트들...
}

<MDXRemote source={post.content} components={mdxComponents} />
```

**파일:**
- `components/mdx/Image.tsx` (신규)
- `components/mdx/index.ts` (신규 - 모든 MDX 컴포넌트 export)
- `app/blog/[slug]/page.tsx`
- `app/projects/[slug]/page.tsx`
- `next.config.ts` (이미지 도메인 설정)

---

### 7. 접근성 개선

**현재 문제점:**
- ARIA 레이블 부족
- 키보드 네비게이션 최적화 필요
- 스크린 리더 지원 부족

**개선 방안:**
```typescript
// 검색 입력 필드
<input
  type="text"
  placeholder="검색어를 입력하세요..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  aria-label="블로그 게시물 검색"
  role="searchbox"
  className="..."
/>

// 태그 버튼
<button
  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
  aria-pressed={selectedTag === tag}
  aria-label={`${tag} 태그로 필터링`}
  className="..."
>
  {tag}
</button>

// 카드 링크
<Link
  href={`/blog/${post.slug}`}
  aria-label={`${post.title} 글 읽기`}
>
  {/* 카드 내용 */}
</Link>

// InteractiveBackground에 skip 링크
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50"
>
  메인 컨텐츠로 건너뛰기
</a>
```

**파일:**
- `app/blog/BlogClient.tsx`
- `components/InteractiveBackground.tsx`
- 모든 인터랙티브 컴포넌트들

---

## 🟢 낮은 우선순위 (Low Priority)

### 8. 테스트 추가

**개선 방안:**
```typescript
// __tests__/lib/blog.test.ts (신규)
import { getAllPosts, getPostBySlug, searchPosts } from '@/lib/blog'

describe('Blog utilities', () => {
  describe('getAllPosts', () => {
    it('should return sorted posts by date', () => {
      const posts = getAllPosts()
      expect(posts).toBeDefined()
      // 날짜 정렬 검증
    })
  })

  describe('getPostBySlug', () => {
    it('should return post for valid slug', () => {
      const post = getPostBySlug('test-post')
      expect(post).toBeDefined()
      expect(post?.slug).toBe('test-post')
    })

    it('should handle Korean characters in slug', () => {
      const koreanSlug = encodeURIComponent('한글-포스트')
      const post = getPostBySlug(koreanSlug)
      expect(post).toBeDefined()
    })
  })
})
```

**필요 패키지:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom vitest
```

---

### 9. RSS 피드 생성

**개선 방안:**
```typescript
// app/feed.xml/route.ts (신규)
import { getAllPosts } from '@/lib/blog'
import RSS from 'rss'

export async function GET() {
  const posts = getAllPosts()

  const feed = new RSS({
    title: 'junogarden',
    description: '개인 프로젝트와 생각을 기록하는 실험 공간',
    feed_url: 'https://junogarden.com/feed.xml',
    site_url: 'https://junogarden.com',
    language: 'ko',
  })

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.description || '',
      url: `https://junogarden.com/blog/${post.slug}`,
      date: new Date(post.date),
      categories: post.tags,
    })
  })

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

**필요 패키지:**
```bash
npm install rss
npm install -D @types/rss
```

---

### 10. 전체 텍스트 검색

**개선 방안:**
- Fuse.js 또는 FlexSearch 라이브러리 사용
- 검색 인덱스를 빌드 타임에 생성
- 클라이언트에서 빠른 검색 제공

```typescript
// lib/search.ts (신규)
import Fuse from 'fuse.js'
import { getAllPosts } from './blog'

export function createSearchIndex() {
  const posts = getAllPosts()

  return new Fuse(posts, {
    keys: ['title', 'description', 'content', 'tags'],
    threshold: 0.3,
    includeScore: true,
  })
}
```

---

### 11. 조회수 추적

**개선 방안:**
- Vercel Analytics 또는 Google Analytics 통합
- 간단한 조회수 카운터 (Redis/Vercel KV 사용)

```typescript
// lib/analytics.ts (신규)
export async function trackPageView(slug: string) {
  // Analytics 로직
}

// app/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  // 서버 사이드에서 조회수 증가
  if (post) {
    await trackPageView(slug)
  }

  // ...
}
```

---

### 12. 다크모드 토글

**개선 방안:**
- next-themes 라이브러리 사용
- 사용자 선호도 저장

```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// components/ThemeToggle.tsx (신규)
'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="..."
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
```

**필요 패키지:**
```bash
npm install next-themes
```

---

## 📋 구현 순서 제안

### Phase 1 (1-2일)
1. 메타데이터 및 SEO 최적화
2. 에러 처리 개선
3. 로딩 상태 개선

### Phase 2 (2-3일)
4. TypeScript 타입 안정성 강화
5. 공통 컴포넌트 추출
6. 접근성 개선

### Phase 3 (1-2일)
7. 이미지 최적화
8. 테스트 추가 (선택)

### Phase 4 (선택 사항)
9. RSS 피드
10. 전체 텍스트 검색
11. 조회수 추적
12. 다크모드 토글

---

## 📝 참고사항

- 모든 변경사항은 기존 기능을 깨뜨리지 않도록 주의
- 각 단계별로 테스트 후 다음 단계 진행
- 성능 영향을 고려하여 점진적으로 개선
- 기존 디자인 테마와 일관성 유지
