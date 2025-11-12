# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**junogarden-web** is a personal blog and portfolio website built with Next.js 15, featuring a content-driven architecture with MDX support for blog posts and project showcases. The site uses a green nature-inspired design theme with interactive particle backgrounds.

## Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint (uses next lint)
```

### Testing Content
- Add blog posts: Create `.md` files in `content/blog/`
- Add projects: Create `.md` files in `content/projects/`
- View locally: Run `npm run dev` and navigate to http://localhost:3000

## Architecture

### Content Management System
The project implements a file-based CMS using markdown files:

- **Content Storage**: All content lives in `content/` directory
  - `content/blog/`: Blog posts with frontmatter (title, date, description, tags)
  - `content/projects/`: Project showcases with metadata (title, description, date, tags, link, github)

- **Content Processing**:
  - `lib/blog.ts` and `lib/projects.ts` handle file reading, parsing, and filtering
  - Uses `gray-matter` for frontmatter parsing
  - Uses `next-mdx-remote` for MDX rendering with RSC support
  - Both libraries implement caching through Next.js SSG via `generateStaticParams()`

### Page Structure
- **App Router**: Uses Next.js 15 App Router (not Pages Router)
- **Server Components by default**: All pages are React Server Components unless marked with `"use client"`
- **Client Components**:
  - `components/InteractiveBackground.tsx`: Canvas-based particle animation
  - `app/blog/BlogClient.tsx`: Search and filter functionality for blog posts

### Routing
```
/ (app/page.tsx)                          # Homepage with navigation cards
/blog (app/blog/page.tsx)                 # Blog list with search/filter
/blog/[slug] (app/blog/[slug]/page.tsx)   # Individual blog post
/projects (app/projects/page.tsx)          # Projects grid
/projects/[slug] (app/projects/[slug]/page.tsx) # Individual project
```

### Styling System
- **Tailwind CSS v4**: Uses new inline `@theme` directive in `globals.css`
- **CSS Variables**: Color scheme defined in `:root` with dark mode support
- **Design Tokens**:
  - `--primary`: #4a7c2c (main green)
  - `--secondary`: #6b9b3c (lighter green)
  - `--accent`: #8bc34a (highlight green)
- **Prose Styling**: Custom markdown styles in `globals.css` for consistent content rendering
- **Animations**: Custom keyframe animations (float, glow, fadeInUp) defined in globals.css

### Interactive Background
The `InteractiveBackground` component creates a particle system:
- 50 particles with random velocity
- Particles repel from mouse cursor
- Lines connect nearby particles (within 150px)
- Reads `--primary` CSS variable for theming
- Runs on requestAnimationFrame for smooth 60fps

### Blog Post Handling
Special case: Blog posts can have Korean or special characters in filenames:
- `createSlug()` in `lib/blog.ts` uses `encodeURIComponent()` for slugs
- `getPostBySlug()` uses `decodeURIComponent()` when reading files
- This allows filenames like `[Algorithm] 백준 1911  흙길 보수하기.md`

### Static Site Generation
- All blog/project pages use `generateStaticParams()` for SSG
- Content is read at build time, not runtime
- No dynamic data fetching or API routes currently

## File Organization Patterns

When working with this codebase:

1. **Adding New Features**:
   - Create reusable utilities in `lib/`
   - Add client components in `components/`
   - Keep pages minimal, delegate logic to lib functions

2. **Content Structure**: All markdown files should have frontmatter:
   ```yaml
   ---
   title: "Post Title"
   date: 2025-11-12
   description: "Brief description"
   tags: ["tag1", "tag2"]
   ---
   ```

3. **Component Patterns**:
   - Use Server Components by default
   - Only add `"use client"` for interactivity (state, effects, browser APIs)
   - Keep client components focused and small

## Key Technical Decisions

### Why These Technologies?
- **Next.js 15 + Turbopack**: Latest features, faster builds
- **App Router**: Better than Pages Router for nested layouts and streaming
- **MDX Remote**: Allows dynamic MDX without bundling all content
- **File-based CMS**: Simple, Git-friendly, no database needed
- **Tailwind v4**: Improved performance, better DX with inline theme

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js + TypeScript rules
- **Path Aliases**: `@/*` maps to project root

## Refactoring Opportunities

### High Priority
1. **Metadata Generation**: Update `app/layout.tsx` metadata (currently shows "Create Next App")
2. **SEO Optimization**: Add per-page metadata in blog/project detail pages
3. **Error Handling**: Add proper error boundaries for MDX rendering failures
4. **Loading States**: Add suspense boundaries for better UX

### Medium Priority
5. **Component Extraction**: Extract repeated card layouts into shared components
6. **Performance**: Add image optimization for blog/project images
7. **Accessibility**: Add proper ARIA labels, focus management
8. **Type Safety**: Create shared TypeScript types for common patterns (Card, Link components)

### Low Priority
9. **Testing**: Add unit tests for content parsing functions
10. **Analytics**: Add view tracking for blog posts
11. **RSS Feed**: Generate RSS feed for blog posts
12. **Search Optimization**: Consider adding full-text search with a library

## Common Pitfalls

1. **Server vs Client Components**: Don't add `"use client"` unless you need browser APIs or hooks
2. **Slug Encoding**: Always use `encodeURIComponent`/`decodeURIComponent` for blog slugs
3. **Async Params**: In Next.js 15, route params are async - use `await params` in dynamic routes
4. **CSS Variables**: Theme colors come from CSS variables, not Tailwind config
5. **MDX Components**: Custom MDX components need to be passed to `<MDXRemote components={...} />`

## Development Workflow

1. **Adding New Blog Post**:
   - Create `content/blog/title.md` with frontmatter
   - Run `npm run dev` to verify formatting
   - Commit the markdown file

2. **Modifying Styles**:
   - Edit CSS variables in `app/globals.css` for theme changes
   - Tailwind classes work alongside custom CSS
   - Rebuild is required for Tailwind changes

3. **Adding New Route**:
   - Create folder in `app/`
   - Add `page.tsx` for the route
   - Consider if it needs `layout.tsx` or `loading.tsx`

## Notes for AI Assistants

- This is a **personal portfolio/blog**, not a commercial product
- Content is in **Korean and English** - respect the language in existing content
- The design theme is **nature/garden inspired** (green colors, organic animations)
- Performance matters - this should be a **fast, lightweight static site**
- When suggesting changes, **preserve the existing aesthetic and UX patterns**
