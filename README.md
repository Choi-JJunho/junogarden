# 🌿 junogarden

개인 블로그와 프로젝트를 기록하는 실험적 공간입니다.

## ✨ 특징

- 🚀 **Next.js 15** - 최신 App Router와 Turbopack 기반
- 📝 **MDX 지원** - 마크다운으로 블로그 포스트와 프로젝트 작성
- 🌌 **우주 테마** - 우주와 별을 테마로 한 감각적인 디자인
- ✨ **인터랙티브 배경** - Canvas 기반 파티클 애니메이션과 별빛 효과
- 🔍 **검색 및 필터링** - 태그와 키워드로 글 검색
- 📱 **반응형 디자인** - 모바일부터 데스크톱까지 최적화
- ⚡ **정적 사이트 생성** - 빌드 타임에 모든 페이지 사전 렌더링

## 🛠 기술 스택

- **프레임워크**: Next.js 15.5.4, React 19.1.0
- **스타일링**: Tailwind CSS v4, Custom CSS Variables
- **컨텐츠**: MDX (next-mdx-remote), gray-matter
- **언어**: TypeScript
- **빌드**: Turbopack

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 20 이상
- npm, yarn, pnpm 또는 bun

### 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:18888)
npm run dev
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행 (포트 18888)
npm start
```

### Docker 배포

```bash
# Docker Compose로 실행
docker-compose up -d

# Docker Hub에 멀티 플랫폼 이미지 푸시
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t junho5336/homepage:latest \
  --push \
  .

# 또는 Makefile 사용
make build-push
```

자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

### 코드 품질

```bash
# ESLint 실행
npm run lint
```

## 📁 프로젝트 구조

```
junogarden-web/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈페이지
│   ├── blog/                # 블로그 페이지
│   │   ├── page.tsx        # 블로그 목록
│   │   ├── [slug]/         # 개별 블로그 포스트
│   │   └── BlogClient.tsx  # 클라이언트 컴포넌트 (검색/필터)
│   └── projects/            # 프로젝트 페이지
│       ├── page.tsx        # 프로젝트 목록
│       └── [slug]/         # 개별 프로젝트 상세
├── components/              # 재사용 가능한 컴포넌트
│   └── InteractiveBackground.tsx  # 파티클 배경 애니메이션
├── content/                 # 마크다운 컨텐츠
│   ├── blog/               # 블로그 포스트 (.md)
│   └── projects/           # 프로젝트 소개 (.md)
├── lib/                     # 유틸리티 함수
│   ├── blog.ts             # 블로그 데이터 처리
│   └── projects.ts         # 프로젝트 데이터 처리
├── public/                  # 정적 파일 (이미지 등)
└── app/globals.css          # 글로벌 스타일 및 테마
```

## ✍️ 컨텐츠 추가하기

### 블로그 포스트 작성

`content/blog/` 폴더에 `.md` 파일을 생성합니다:

```markdown
---
title: "포스트 제목"
date: 2025-11-12
description: "포스트에 대한 간단한 설명"
tags: ["태그1", "태그2", "태그3"]
---

# 본문 시작

여기에 마크다운 형식으로 내용을 작성합니다...
```

### 프로젝트 추가

`content/projects/` 폴더에 `.md` 파일을 생성합니다:

```markdown
---
title: "프로젝트 이름"
description: "프로젝트 설명"
date: 2025-11-12
tags: ["React", "TypeScript", "Next.js"]
link: "https://project-demo.com"
github: "https://github.com/username/repo"
---

# 프로젝트 상세 설명

프로젝트의 자세한 내용...
```

### 이미지 추가

이미지는 `public/images/` 폴더에 저장하고 마크다운에서 다음과 같이 참조합니다:

```markdown
![이미지 설명](/images/filename.png)
```

## 🎨 디자인 커스터마이징

### 색상 테마 변경

`app/globals.css`의 CSS 변수를 수정:

```css
:root {
  --background: #0a0e27;    /* 배경색 (우주 배경) */
  --foreground: #e8f4f8;    /* 전경색 (텍스트) */
  --primary: #4fc3f7;       /* 주요 색상 (시안) */
  --secondary: #b794f6;     /* 보조 색상 (퍼플) */
  --accent: #ffd93d;        /* 강조 색상 (골드) */
  --star-glow: #00d4ff;     /* 별빛 효과 */
  --nebula-purple: #7c3aed; /* 성운 퍼플 */
  --nebula-pink: #f472b6;   /* 성운 핑크 */
}
```

글로벌 스타일에는 별빛 반짝임 효과와 우주 그라데이션 배경이 포함되어 있습니다.

### 애니메이션 조정

- 파티클 개수: `components/InteractiveBackground.tsx`의 `particleCount` 변경
- 연결 거리: `connectionDistance` 값 조정
- 속도: `vx`, `vy` 값 조정

## 🔧 개발 가이드

### 새로운 페이지 추가

1. `app/` 폴더에 새 폴더 생성
2. `page.tsx` 파일 추가
3. 필요시 `layout.tsx`, `loading.tsx` 추가

### 컴포넌트 작성 원칙

- 기본적으로 **Server Component** 사용
- 상태, 이벤트, 브라우저 API 필요시에만 `"use client"` 추가
- 재사용 가능한 컴포넌트는 `components/` 폴더에 배치

### 타입 안정성

- 모든 함수와 컴포넌트에 타입 명시
- `strict` 모드 활성화 상태
- `@/*` 경로 별칭 사용 가능

## 📚 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [MDX 문서](https://mdxjs.com/)

## 📄 라이선스

개인 프로젝트

## 👤 작성자

**junho** - [GitHub](https://github.com/junho)

---

© 2025 junogarden
