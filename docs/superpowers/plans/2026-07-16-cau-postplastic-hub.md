# 중앙대학교 포스트 플라스틱 허브 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub Pages에서 무료로 운영되며 비개발자 담당자가 웹에서 콘텐츠를 등록하는, 회원가입·DB 없는 중앙대 포스트 플라스틱 순환경제 콘텐츠 사이트를 구축한다.

**Architecture:** Astro가 마크다운 콘텐츠 컬렉션(공지/뉴스/자료)으로 목록·상세 페이지를 정적 생성한다. 담당자는 Sveltia CMS(`/admin`)에서 GitHub 로그인 후 글을 발행하면 저장소에 마크다운이 커밋되고, GitHub Actions가 Astro를 빌드해 GitHub Pages에 배포한다. GitHub OAuth는 Cloudflare Worker 인증 핸들러가 처리한다.

**Tech Stack:** Astro 5, TypeScript, Vitest, Sveltia CMS, GitHub Actions, GitHub Pages, Cloudflare Workers(OAuth).

## Global Constraints

- Node.js **20 이상** (개발 환경 v24 확인). 패키지 매니저 **npm**.
- **DB·서버 사이드 런타임 금지.** 모든 콘텐츠는 저장소 내 마크다운 파일(`src/content/**/*.md`).
- **회원가입 없음.** 방문자 읽기 전용. 쓰기는 저장소 협업자 GitHub 계정만.
- UI 텍스트·콘텐츠 언어는 **한국어**.
- 세 게시판(`notices`, `news`, `resources`)은 **동일한 목록/상세 컴포넌트를 재사용**한다 — 게시판별 중복 구현 금지.
- 사이트는 GitHub Pages **프로젝트 페이지**로 배포될 수 있어야 한다 → 모든 내부 링크는 `import.meta.env.BASE_URL` 기반 헬퍼(`withBase`)를 사용한다.
- 배포 대상 값(GitHub `owner/repo`, base 경로, OAuth Worker 도메인)은 `src/consts.ts`·`astro.config.mjs`·`public/admin/config.yml` 한 곳씩에만 존재하며, 실제 값은 배포 단계에서 확정한다.

---

## File Structure

```
package.json                     # 의존성·스크립트
astro.config.mjs                 # site/base, integrations
tsconfig.json
vitest.config.ts
src/
  consts.ts                      # 사이트명·네비게이션·소유자 등 상수 (단일 소스)
  content.config.ts              # notices/news/resources 컬렉션 스키마
  content/
    notices/2026-07-16-example.md
    news/2026-07-10-example.md
    resources/2026-07-01-example.md
  lib/
    url.ts                       # withBase() 링크 헬퍼
    posts.ts                     # 정렬/드래프트 필터/최신 N/페이지네이션
  layouts/
    BaseLayout.astro             # html shell + Header + Footer
  components/
    Header.astro
    Footer.astro
    PostCard.astro               # 카드(홈·목록 공용)
    PostList.astro               # 재사용 목록 + 페이지네이션 + 빈 상태
  pages/
    index.astro                  # 홈
    about.astro                  # About(정적)
    notices/index.astro          # 목록
    notices/[...slug].astro      # 상세
    news/index.astro
    news/[...slug].astro
    resources/index.astro
    resources/[...slug].astro
    404.astro
  styles/
    global.css                   # 중앙대 브랜딩 토큰 + 레이아웃
tests/
  posts.test.ts                  # posts.ts 유닛 테스트
  build.test.ts                  # dist 산출물 검증
public/
  admin/
    index.html                   # Sveltia CMS 진입점
    config.yml                   # CMS 컬렉션 설정
  uploads/.gitkeep               # 미디어 업로드 폴더
  robots.txt                     # /admin 크롤 차단
.github/workflows/deploy.yml     # 빌드·배포
oauth-worker/
  src/index.js                   # GitHub OAuth 핸들러(Cloudflare Worker)
  wrangler.toml
  README.md                      # Worker 배포 가이드
docs/
  manual/관리자-매뉴얼.md          # 담당자용 한글 매뉴얼
  setup/배포-셋업-가이드.md        # OAuth·Pages 최초 설정
```

---

### Task 1: 프로젝트 스캐폴드 + 공통 레이아웃

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/consts.ts`, `src/lib/url.ts`, `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Create: `src/pages/index.astro` (임시 홈)

**Interfaces:**
- Produces: `SITE`, `NAV` (from `consts.ts`); `withBase(path: string): string` (from `lib/url.ts`); `BaseLayout` (props: `title: string`, `description?: string`).

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "cau-postplastic-hub",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.6.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: 의존성 설치**

Run: `npm install`
Expected: `node_modules/` 생성, 에러 없음.

- [ ] **Step 3: astro.config.mjs 작성**

`site`/`base`는 GitHub Pages 프로젝트 페이지 대응. 실제 값은 배포 단계(Task 10)에서 확정하며, 기본값으로 개발 진행.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

// 배포 시 확정: 프로젝트 페이지면 site='https://<owner>.github.io', base='/<repo>'
export default defineConfig({
  site: 'https://example.github.io',
  base: '/',
  trailingSlash: 'ignore',
});
```

- [ ] **Step 4: tsconfig.json 작성**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: .gitignore 작성**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 6: src/consts.ts 작성 (사이트 상수 단일 소스)**

```ts
// src/consts.ts
export const SITE = {
  title: '중앙대학교 포스트 플라스틱 허브',
  shortTitle: 'CAU 포스트 플라스틱',
  description: '탈플라스틱·순환경제 인재양성 플랫폼 (중앙대학교)',
  contact: '서울특별시 동작구 흑석로 84 중앙대학교',
  email: 'contact@example.ac.kr',
};

export type NavItem = { label: string; href: string };

export const NAV: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: '공지사항', href: '/notices' },
  { label: '이슈·뉴스', href: '/news' },
  { label: '전문정보', href: '/resources' },
];
```

- [ ] **Step 7: src/lib/url.ts 작성 (BASE 경로 링크 헬퍼)**

```ts
// src/lib/url.ts
// GitHub Pages 프로젝트 페이지의 base 경로를 모든 내부 링크에 안전하게 적용.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL; // 예: '/' 또는 '/repo/'
  const joined = `${base}/${path}`.replace(/\/{2,}/g, '/');
  return joined === '' ? '/' : joined;
}
```

- [ ] **Step 8: src/styles/global.css 작성 (중앙대 브랜딩 토큰)**

```css
/* src/styles/global.css */
:root {
  --cau-blue: #0033a0;        /* 중앙대 메인 블루 (배포 시 정확값 확정) */
  --cau-blue-dark: #002271;
  --cau-accent: #00a0e9;
  --ink: #1a1a1a;
  --muted: #666;
  --line: #e5e7eb;
  --bg: #ffffff;
  --bg-soft: #f5f7fa;
  --maxw: 1140px;
}
* { box-sizing: border-box; }
html { font-family: system-ui, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; color: var(--ink); }
body { margin: 0; background: var(--bg); line-height: 1.6; }
a { color: var(--cau-blue); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; }
.container { max-width: var(--maxw); margin: 0 auto; padding: 0 20px; }
.btn { display: inline-block; padding: 10px 18px; background: var(--cau-blue); color: #fff; border-radius: 6px; }
.btn:hover { background: var(--cau-blue-dark); text-decoration: none; }
h1,h2,h3 { line-height: 1.3; }
.visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); }
```

- [ ] **Step 9: src/components/Header.astro 작성**

```astro
---
// src/components/Header.astro
import { SITE, NAV } from '../consts';
import { withBase } from '../lib/url';
---
<header class="site-header">
  <div class="container bar">
    <a class="brand" href={withBase('/')}>{SITE.shortTitle}</a>
    <nav aria-label="주 메뉴">
      <ul>
        {NAV.map((item) => (
          <li><a href={withBase(item.href)}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
  </div>
</header>
<style>
  .site-header { background: var(--cau-blue); color: #fff; }
  .bar { display: flex; align-items: center; justify-content: space-between; height: 64px; }
  .brand { color: #fff; font-weight: 700; font-size: 1.1rem; }
  nav ul { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0; }
  nav a { color: #fff; font-weight: 500; }
  @media (max-width: 640px) {
    .bar { flex-direction: column; height: auto; padding-top: 12px; padding-bottom: 12px; gap: 8px; }
    nav ul { gap: 16px; flex-wrap: wrap; justify-content: center; }
  }
</style>
```

- [ ] **Step 10: src/components/Footer.astro 작성**

```astro
---
// src/components/Footer.astro
import { SITE } from '../consts';
---
<footer class="site-footer">
  <div class="container">
    <p class="title">{SITE.title}</p>
    <p>{SITE.contact}</p>
    <p>{SITE.email}</p>
    <p class="copy">© {new Date().getFullYear()} {SITE.title}</p>
  </div>
</footer>
<style>
  .site-footer { background: var(--bg-soft); border-top: 1px solid var(--line); margin-top: 64px; padding: 32px 0; color: var(--muted); font-size: .9rem; }
  .site-footer .title { color: var(--ink); font-weight: 700; }
  .site-footer p { margin: 4px 0; }
  .copy { margin-top: 12px; }
</style>
```

- [ ] **Step 11: src/layouts/BaseLayout.astro 작성**

```astro
---
// src/layouts/BaseLayout.astro
import { SITE } from '../consts';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';
interface Props { title: string; description?: string; }
const { title, description = SITE.description } = Astro.props;
const fullTitle = title === SITE.title ? title : `${title} | ${SITE.shortTitle}`;
---
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <Header />
    <main class="container" style="min-height: 60vh; padding-top: 32px;">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 12: src/pages/index.astro 임시 홈 작성**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../consts';
---
<BaseLayout title={SITE.title}>
  <h1>{SITE.title}</h1>
  <p>{SITE.description}</p>
</BaseLayout>
```

- [ ] **Step 13: 빌드 검증**

Run: `npm run build`
Expected: 빌드 성공, `dist/index.html` 생성.

- [ ] **Step 14: 커밋**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/
git commit -m "feat: Astro 스캐폴드 및 공통 레이아웃(헤더/푸터/브랜딩)"
```

---

### Task 2: 콘텐츠 컬렉션 스키마 + 샘플 콘텐츠

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/notices/2026-07-16-example.md`
- Create: `src/content/news/2026-07-10-example.md`
- Create: `src/content/resources/2026-07-01-example.md`

**Interfaces:**
- Produces: 컬렉션 `notices`, `news`, `resources`. 각 엔트리 `data`는 `{ title: string; date: Date; category: string; thumbnail?: string; attachments?: {name,url}[]; externalLink?: string; draft: boolean }`. `entry.id`는 파일명 기반 슬러그.

- [ ] **Step 1: src/content.config.ts 작성**

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const attachment = z.object({ name: z.string(), url: z.string() });

const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['공지', '세미나', '행사']),
    thumbnail: z.string().optional(),
    attachments: z.array(attachment).optional(),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['정책', '보고서', '인터뷰', '채용']),
    thumbnail: z.string().optional(),
    externalLink: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['논문', '자료', '인턴십']),
    attachments: z.array(attachment).optional(),
    externalLink: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notices, news, resources };
```

- [ ] **Step 2: 샘플 공지 작성**

```markdown
<!-- src/content/notices/2026-07-16-example.md -->
---
title: "제1회 순환경제 세미나 개최 안내"
date: 2026-07-16
category: "세미나"
draft: false
---

중앙대학교 포스트 플라스틱 허브의 첫 세미나를 개최합니다. 많은 참여 바랍니다.
```

- [ ] **Step 3: 샘플 뉴스 작성**

```markdown
<!-- src/content/news/2026-07-10-example.md -->
---
title: "탈플라스틱 정책 동향 브리프"
date: 2026-07-10
category: "정책"
draft: false
---

최근 국내외 탈플라스틱 정책 동향을 정리한 브리프입니다.
```

- [ ] **Step 4: 샘플 자료 작성**

```markdown
<!-- src/content/resources/2026-07-01-example.md -->
---
title: "생분해성 플라스틱 연구자료"
date: 2026-07-01
category: "자료"
draft: false
---

생분해성 플라스틱 관련 참고 자료입니다.
```

- [ ] **Step 5: 스키마 검증**

Run: `npm run check`
Expected: 콘텐츠 타입 에러 없음(성공).

- [ ] **Step 6: 커밋**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: 콘텐츠 컬렉션 스키마(공지/뉴스/자료) 및 샘플 콘텐츠"
```

---

### Task 3: 게시글 헬퍼 라이브러리 (TDD)

**Files:**
- Create: `src/lib/posts.ts`
- Create: `tests/posts.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces (from `lib/posts.ts`):
  - `type PostLike = { data: { date: Date; draft: boolean } }`
  - `sortByDateDesc<T extends PostLike>(posts: T[]): T[]`
  - `publishedOnly<T extends PostLike>(posts: T[]): T[]`
  - `latest<T extends PostLike>(posts: T[], n: number): T[]`
  - `paginate<T>(items: T[], page: number, perPage: number): { items: T[]; page: number; totalPages: number }`

- [ ] **Step 1: vitest.config.ts 작성**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/**/*.test.ts'] } });
```

- [ ] **Step 2: 실패하는 테스트 작성**

```ts
// tests/posts.test.ts
import { describe, it, expect } from 'vitest';
import { sortByDateDesc, publishedOnly, latest, paginate } from '../src/lib/posts';

const mk = (date: string, draft = false) => ({ data: { date: new Date(date), draft } });

describe('posts helpers', () => {
  it('최신순으로 정렬한다', () => {
    const out = sortByDateDesc([mk('2026-01-01'), mk('2026-03-01'), mk('2026-02-01')]);
    expect(out.map(p => p.data.date.getMonth())).toEqual([2, 1, 0]);
  });

  it('draft를 제외한다', () => {
    const out = publishedOnly([mk('2026-01-01'), mk('2026-02-01', true)]);
    expect(out).toHaveLength(1);
  });

  it('최신 N개를 반환한다', () => {
    const out = latest([mk('2026-01-01'), mk('2026-03-01'), mk('2026-02-01')], 2);
    expect(out).toHaveLength(2);
    expect(out[0].data.date.getMonth()).toBe(2);
  });

  it('페이지네이션한다', () => {
    const items = [1, 2, 3, 4, 5];
    const p = paginate(items, 2, 2);
    expect(p.items).toEqual([3, 4]);
    expect(p.totalPages).toBe(3);
    expect(p.page).toBe(2);
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npx vitest run tests/posts.test.ts`
Expected: FAIL — `src/lib/posts` 모듈/함수 없음.

- [ ] **Step 4: src/lib/posts.ts 구현**

```ts
// src/lib/posts.ts
export type PostLike = { data: { date: Date; draft: boolean } };

export function sortByDateDesc<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function publishedOnly<T extends PostLike>(posts: T[]): T[] {
  return posts.filter((p) => !p.data.draft);
}

export function latest<T extends PostLike>(posts: T[], n: number): T[] {
  return sortByDateDesc(publishedOnly(posts)).slice(0, n);
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: current, totalPages };
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run tests/posts.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: 커밋**

```bash
git add src/lib/posts.ts tests/posts.test.ts vitest.config.ts
git commit -m "feat: 게시글 정렬/필터/페이지네이션 헬퍼 + 유닛 테스트"
```

---

### Task 4: 재사용 목록/카드 컴포넌트 + 공지 게시판 페이지

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/PostList.astro`
- Create: `src/pages/notices/index.astro`, `src/pages/notices/[...slug].astro`

**Interfaces:**
- Consumes: `latest/publishedOnly/sortByDateDesc/paginate` (Task 3), `withBase` (Task 1), 컬렉션 `notices` (Task 2).
- Produces:
  - `PostCard` props: `{ href: string; title: string; date: Date; category: string; thumbnail?: string }`
  - `PostList` props: `{ base: string; posts: {id;data}[]; page?: number; perPage?: number }` — 최신순·발행분만·페이지네이션·빈 상태 렌더.

- [ ] **Step 1: PostCard 컴포넌트 작성**

```astro
---
// src/components/PostCard.astro
import { withBase } from '../lib/url';
interface Props { href: string; title: string; date: Date; category: string; thumbnail?: string; }
const { href, title, date, category, thumbnail } = Astro.props;
const img = thumbnail ?? '/placeholder.svg';
const dateStr = date.toISOString().slice(0, 10);
---
<a class="card" href={href}>
  <img src={withBase(img)} alt="" loading="lazy" />
  <div class="body">
    <span class="cat">{category}</span>
    <h3>{title}</h3>
    <time datetime={dateStr}>{dateStr}</time>
  </div>
</a>
<style>
  .card { display: block; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: #fff; color: inherit; }
  .card:hover { text-decoration: none; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
  .card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: var(--bg-soft); }
  .body { padding: 14px 16px; }
  .cat { display: inline-block; font-size: .75rem; color: #fff; background: var(--cau-accent); padding: 2px 8px; border-radius: 999px; }
  .body h3 { margin: 8px 0 6px; font-size: 1rem; }
  time { color: var(--muted); font-size: .85rem; }
</style>
```

- [ ] **Step 2: PostList 컴포넌트 작성**

```astro
---
// src/components/PostList.astro
import PostCard from './PostCard.astro';
import { withBase } from '../lib/url';
import { publishedOnly, sortByDateDesc, paginate } from '../lib/posts';
interface Entry { id: string; data: { title: string; date: Date; category: string; thumbnail?: string; draft: boolean } }
interface Props { base: string; posts: Entry[]; page?: number; perPage?: number; }
const { base, posts, page = 1, perPage = 9 } = Astro.props;
const sorted = sortByDateDesc(publishedOnly(posts));
const { items, page: cur, totalPages } = paginate(sorted, page, perPage);
---
{items.length === 0 ? (
  <p class="empty">등록된 글이 없습니다.</p>
) : (
  <div class="grid">
    {items.map((post) => (
      <PostCard
        href={withBase(`${base}/${post.id}`)}
        title={post.data.title}
        date={post.data.date}
        category={post.data.category}
        thumbnail={post.data.thumbnail}
      />
    ))}
  </div>
)}
{totalPages > 1 && (
  <nav class="pager" aria-label="페이지">
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
      <a class={n === cur ? 'on' : ''} href={withBase(n === 1 ? base : `${base}?page=${n}`)}>{n}</a>
    ))}
  </nav>
)}
<style>
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
  .empty { color: var(--muted); padding: 40px 0; text-align: center; }
  .pager { display: flex; gap: 8px; justify-content: center; margin-top: 28px; }
  .pager a { padding: 6px 12px; border: 1px solid var(--line); border-radius: 6px; }
  .pager a.on { background: var(--cau-blue); color: #fff; }
</style>
```

> 참고: 정적 빌드에서 `?page=` 쿼리는 서버 없이 페이지네이션 상태를 완전히 반영하지 못한다. 초기 범위에서는 첫 페이지(9개)와 페이지 번호 UI를 노출하되, perPage를 크게(예: 30) 두어 실사용상 대부분 한 페이지에 표시되게 한다. 다중 페이지 정적 생성은 후속 개선(범위 밖).

- [ ] **Step 3: 공지 목록 페이지 작성**

```astro
---
// src/pages/notices/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';
const posts = await getCollection('notices');
---
<BaseLayout title="공지사항·세미나·행사">
  <h1>공지사항·세미나·행사</h1>
  <PostList base="/notices" posts={posts} perPage={30} />
</BaseLayout>
```

- [ ] **Step 4: 공지 상세 페이지 작성**

```astro
---
// src/pages/notices/[...slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { withBase } from '../../lib/url';
import { getCollection, render } from 'astro:content';
export async function getStaticPaths() {
  const posts = await getCollection('notices', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
const dateStr = post.data.date.toISOString().slice(0, 10);
---
<BaseLayout title={post.data.title}>
  <article>
    <p class="meta"><span class="cat">{post.data.category}</span> · <time>{dateStr}</time></p>
    <h1>{post.data.title}</h1>
    {post.data.thumbnail && <img src={withBase(post.data.thumbnail)} alt="" />}
    <div class="prose"><Content /></div>
    {post.data.attachments && post.data.attachments.length > 0 && (
      <section class="attach">
        <h2>첨부파일</h2>
        <ul>{post.data.attachments.map((a) => <li><a href={withBase(a.url)}>{a.name}</a></li>)}</ul>
      </section>
    )}
    <p><a href={withBase('/notices')}>← 목록으로</a></p>
  </article>
</BaseLayout>
<style>
  .meta { color: var(--muted); }
  .cat { color: #fff; background: var(--cau-accent); padding: 2px 8px; border-radius: 999px; font-size: .8rem; }
  .prose { margin: 24px 0; }
  .attach { border-top: 1px solid var(--line); padding-top: 16px; }
</style>
```

- [ ] **Step 5: placeholder 이미지 추가**

```bash
mkdir -p public
cat > public/placeholder.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#e5e7eb"/><text x="160" y="95" text-anchor="middle" fill="#9aa0a6" font-family="sans-serif" font-size="16">CAU 포스트 플라스틱</text></svg>
SVG
```

- [ ] **Step 6: 빌드 검증**

Run: `npm run build`
Expected: 성공. `dist/notices/index.html`과 `dist/notices/2026-07-16-example/index.html` 생성.

- [ ] **Step 7: 산출물 확인**

Run: `node -e "const fs=require('fs');const h=fs.readFileSync('dist/notices/2026-07-16-example/index.html','utf8');if(!h.includes('제1회 순환경제 세미나'))throw new Error('본문 누락');console.log('OK')"`
Expected: `OK`

- [ ] **Step 8: 커밋**

```bash
git add src/components/PostCard.astro src/components/PostList.astro src/pages/notices/ public/placeholder.svg
git commit -m "feat: 재사용 목록/카드 컴포넌트 및 공지 게시판(목록·상세)"
```

---

### Task 5: 뉴스·자료 게시판 페이지 (컴포넌트 재사용)

**Files:**
- Create: `src/pages/news/index.astro`, `src/pages/news/[...slug].astro`
- Create: `src/pages/resources/index.astro`, `src/pages/resources/[...slug].astro`

**Interfaces:**
- Consumes: `PostList` (Task 4), `getCollection/render`, `withBase`. 컬렉션 `news`, `resources` (Task 2).

- [ ] **Step 1: 뉴스 목록 페이지 작성**

```astro
---
// src/pages/news/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';
const posts = await getCollection('news');
---
<BaseLayout title="이슈·뉴스">
  <h1>이슈·뉴스</h1>
  <PostList base="/news" posts={posts} perPage={30} />
</BaseLayout>
```

- [ ] **Step 2: 뉴스 상세 페이지 작성**

```astro
---
// src/pages/news/[...slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { withBase } from '../../lib/url';
import { getCollection, render } from 'astro:content';
export async function getStaticPaths() {
  const posts = await getCollection('news', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
const dateStr = post.data.date.toISOString().slice(0, 10);
---
<BaseLayout title={post.data.title}>
  <article>
    <p class="meta"><span class="cat">{post.data.category}</span> · <time>{dateStr}</time></p>
    <h1>{post.data.title}</h1>
    {post.data.thumbnail && <img src={withBase(post.data.thumbnail)} alt="" />}
    <div class="prose"><Content /></div>
    {post.data.externalLink && <p><a href={post.data.externalLink} target="_blank" rel="noopener">원문 보기 →</a></p>}
    <p><a href={withBase('/news')}>← 목록으로</a></p>
  </article>
</BaseLayout>
<style>
  .meta { color: var(--muted); }
  .cat { color: #fff; background: var(--cau-accent); padding: 2px 8px; border-radius: 999px; font-size: .8rem; }
  .prose { margin: 24px 0; }
</style>
```

- [ ] **Step 3: 자료 목록 페이지 작성**

```astro
---
// src/pages/resources/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';
const posts = await getCollection('resources');
---
<BaseLayout title="전문정보·자료실">
  <h1>전문정보·자료실</h1>
  <PostList base="/resources" posts={posts} perPage={30} />
</BaseLayout>
```

- [ ] **Step 4: 자료 상세 페이지 작성**

```astro
---
// src/pages/resources/[...slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { withBase } from '../../lib/url';
import { getCollection, render } from 'astro:content';
export async function getStaticPaths() {
  const posts = await getCollection('resources', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
const dateStr = post.data.date.toISOString().slice(0, 10);
---
<BaseLayout title={post.data.title}>
  <article>
    <p class="meta"><span class="cat">{post.data.category}</span> · <time>{dateStr}</time></p>
    <h1>{post.data.title}</h1>
    <div class="prose"><Content /></div>
    {post.data.attachments && post.data.attachments.length > 0 && (
      <section class="attach"><h2>첨부파일</h2>
        <ul>{post.data.attachments.map((a) => <li><a href={withBase(a.url)}>{a.name}</a></li>)}</ul>
      </section>
    )}
    {post.data.externalLink && <p><a href={post.data.externalLink} target="_blank" rel="noopener">링크 열기 →</a></p>}
    <p><a href={withBase('/resources')}>← 목록으로</a></p>
  </article>
</BaseLayout>
<style>
  .meta { color: var(--muted); }
  .cat { color: #fff; background: var(--cau-accent); padding: 2px 8px; border-radius: 999px; font-size: .8rem; }
  .prose { margin: 24px 0; }
  .attach { border-top: 1px solid var(--line); padding-top: 16px; }
</style>
```

- [ ] **Step 5: 빌드 검증**

Run: `npm run build`
Expected: 성공. `dist/news/index.html`, `dist/resources/index.html` 및 각 상세 페이지 생성.

- [ ] **Step 6: 커밋**

```bash
git add src/pages/news/ src/pages/resources/
git commit -m "feat: 뉴스·자료 게시판 페이지(공용 컴포넌트 재사용)"
```

---

### Task 6: 홈페이지 + About 페이지

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `latest` (Task 3), `PostCard` (Task 4), `getCollection`, `withBase`, `SITE`.

- [ ] **Step 1: 홈페이지 재작성 (히어로 + 최신 공지/뉴스)**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import { SITE } from '../consts';
import { withBase } from '../lib/url';
import { latest } from '../lib/posts';
import { getCollection } from 'astro:content';
const notices = latest(await getCollection('notices'), 3);
const news = latest(await getCollection('news'), 3);
---
<BaseLayout title={SITE.title}>
  <section class="hero">
    <h1>{SITE.title}</h1>
    <p>{SITE.description}</p>
    <a class="btn" href={withBase('/about')}>사업단 소개 보기</a>
  </section>

  <section class="block">
    <div class="head"><h2>최신 공지</h2><a href={withBase('/notices')}>전체보기 →</a></div>
    <div class="grid">
      {notices.map((p) => <PostCard href={withBase(`/notices/${p.id}`)} title={p.data.title} date={p.data.date} category={p.data.category} thumbnail={p.data.thumbnail} />)}
    </div>
  </section>

  <section class="block">
    <div class="head"><h2>최신 이슈·뉴스</h2><a href={withBase('/news')}>전체보기 →</a></div>
    <div class="grid">
      {news.map((p) => <PostCard href={withBase(`/news/${p.id}`)} title={p.data.title} date={p.data.date} category={p.data.category} thumbnail={p.data.thumbnail} />)}
    </div>
  </section>
</BaseLayout>
<style>
  .hero { background: linear-gradient(135deg, var(--cau-blue), var(--cau-blue-dark)); color: #fff; border-radius: 12px; padding: 56px 32px; text-align: center; }
  .hero h1 { margin: 0 0 12px; font-size: 2rem; }
  .hero .btn { background: #fff; color: var(--cau-blue); margin-top: 16px; }
  .block { margin-top: 48px; }
  .block .head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: About 페이지 작성**

```astro
---
// src/pages/about.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../consts';
---
<BaseLayout title="About">
  <h1>사업단 소개</h1>
  <p>{SITE.description}</p>
  <h2>비전</h2>
  <p>탈플라스틱·순환경제 분야의 융합 인재를 양성하고, 생분해성 소재·자원순환·ESG 전략 연구를 통해 지속가능한 미래에 기여합니다.</p>
  <h2>참여 연구팀</h2>
  <ul>
    <li>환경·화학공학 연구팀</li>
    <li>빅데이터·AI 분석 연구팀</li>
    <li>자원순환 연구팀</li>
  </ul>
  <p class="note">※ 위 내용은 예시이며, 담당자가 관리자 화면 또는 콘텐츠 파일에서 실제 내용으로 교체합니다.</p>
</BaseLayout>
<style>.note { color: var(--muted); font-size: .9rem; margin-top: 32px; }</style>
```

- [ ] **Step 3: 빌드 검증**

Run: `npm run build`
Expected: 성공. `dist/index.html`, `dist/about/index.html` 생성.

- [ ] **Step 4: 홈에 최신 글 노출 확인**

Run: `node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');if(!h.includes('최신 공지'))throw new Error('홈 섹션 누락');console.log('OK')"`
Expected: `OK`

- [ ] **Step 5: 커밋**

```bash
git add src/pages/index.astro src/pages/about.astro
git commit -m "feat: 홈페이지(히어로+최신글) 및 About 페이지"
```

---

### Task 7: 404 페이지 + robots + 빌드 산출물 테스트

**Files:**
- Create: `src/pages/404.astro`
- Create: `public/robots.txt`
- Create: `tests/build.test.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `withBase`.
- Produces: `dist/404.html`; `tests/build.test.ts`가 빌드 산출물 존재를 검증.

- [ ] **Step 1: 404 페이지 작성**

```astro
---
// src/pages/404.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { withBase } from '../lib/url';
---
<BaseLayout title="페이지를 찾을 수 없습니다">
  <div style="text-align:center; padding:64px 0;">
    <h1>404</h1>
    <p>요청하신 페이지를 찾을 수 없습니다.</p>
    <p><a class="btn" href={withBase('/')}>홈으로 돌아가기</a></p>
  </div>
</BaseLayout>
```

- [ ] **Step 2: robots.txt 작성 (관리자 크롤 차단)**

```
User-agent: *
Disallow: /admin
```

- [ ] **Step 3: 빌드 산출물 테스트 작성**

```ts
// tests/build.test.ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';

describe('빌드 산출물', () => {
  const files = [
    'dist/index.html',
    'dist/about/index.html',
    'dist/notices/index.html',
    'dist/news/index.html',
    'dist/resources/index.html',
    'dist/404.html',
    'dist/admin/index.html',
  ];
  for (const f of files) {
    it(`${f} 존재`, () => { expect(existsSync(f)).toBe(true); });
  }
});
```

> 참고: 이 테스트는 `npm run build` 이후 실행한다. `dist/admin/index.html`은 Task 8에서 추가되므로, 이 테스트는 Task 8 완료 후 전체 통과한다. Task 7 시점에는 admin 항목을 제외하고 실행해 확인한다.

- [ ] **Step 4: 빌드 후 테스트 (admin 제외)**

Run: `npm run build && npx vitest run tests/build.test.ts -t "index.html 존재"`
Expected: 홈 등 존재 항목 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/pages/404.astro public/robots.txt tests/build.test.ts
git commit -m "feat: 404 페이지, robots.txt, 빌드 산출물 테스트"
```

---

### Task 8: Sveltia CMS 관리자 화면

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`
- Create: `public/uploads/.gitkeep`

**Interfaces:**
- Consumes: 컬렉션 폴더 경로(`src/content/notices|news|resources`), 스키마 필드(Task 2)와 일치해야 함.
- Produces: `/admin` 정적 CMS 진입점. GitHub 백엔드로 저장소에 마크다운 커밋.

- [ ] **Step 1: admin/index.html 작성**

```html
<!-- public/admin/index.html -->
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>콘텐츠 관리 | CAU 포스트 플라스틱</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js" type="module"></script>
  </body>
</html>
```

- [ ] **Step 2: admin/config.yml 작성 (스키마와 일치)**

`repo`, `base_url`(OAuth Worker 도메인)은 배포 단계(Task 10/11)에서 실제 값으로 확정.

```yaml
# public/admin/config.yml
backend:
  name: github
  repo: OWNER/REPO           # 배포 시 확정
  branch: main
  base_url: https://OAUTH-WORKER-DOMAIN   # 배포 시 확정 (Task 11)

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  - name: notices
    label: "공지사항·세미나·행사"
    folder: "src/content/notices"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "제목", name: "title", widget: "string" }
      - { label: "날짜", name: "date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - { label: "분류", name: "category", widget: "select", options: ["공지", "세미나", "행사"] }
      - { label: "썸네일", name: "thumbnail", widget: "image", required: false }
      - label: "첨부파일"
        name: "attachments"
        widget: "list"
        required: false
        fields:
          - { label: "파일명", name: "name", widget: "string" }
          - { label: "파일", name: "url", widget: "file" }
      - { label: "임시저장(체크 시 비공개)", name: "draft", widget: "boolean", default: false }
      - { label: "본문", name: "body", widget: "markdown" }

  - name: news
    label: "이슈·뉴스"
    folder: "src/content/news"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "제목", name: "title", widget: "string" }
      - { label: "날짜", name: "date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - { label: "분류", name: "category", widget: "select", options: ["정책", "보고서", "인터뷰", "채용"] }
      - { label: "썸네일", name: "thumbnail", widget: "image", required: false }
      - { label: "원문 링크", name: "externalLink", widget: "string", required: false }
      - { label: "임시저장(체크 시 비공개)", name: "draft", widget: "boolean", default: false }
      - { label: "본문", name: "body", widget: "markdown" }

  - name: resources
    label: "전문정보·자료실"
    folder: "src/content/resources"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "제목", name: "title", widget: "string" }
      - { label: "날짜", name: "date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - { label: "분류", name: "category", widget: "select", options: ["논문", "자료", "인턴십"] }
      - label: "첨부파일"
        name: "attachments"
        widget: "list"
        required: false
        fields:
          - { label: "파일명", name: "name", widget: "string" }
          - { label: "파일", name: "url", widget: "file" }
      - { label: "외부 링크", name: "externalLink", widget: "string", required: false }
      - { label: "임시저장(체크 시 비공개)", name: "draft", widget: "boolean", default: false }
      - { label: "본문", name: "body", widget: "markdown" }
```

> 주의: CMS의 `body` 위젯이 마크다운 본문을, 나머지 필드가 프론트매터를 생성한다. 필드명·`options` 값은 `src/content.config.ts`의 Zod enum과 **정확히 일치**해야 빌드가 통과한다.

- [ ] **Step 3: 업로드 폴더 유지 파일 생성**

```bash
mkdir -p public/uploads && touch public/uploads/.gitkeep
```

- [ ] **Step 4: 빌드 + 전체 산출물 테스트**

Run: `npm run build && npx vitest run tests/build.test.ts`
Expected: 모든 항목 PASS (`dist/admin/index.html` 포함).

- [ ] **Step 5: 커밋**

```bash
git add public/admin/ public/uploads/.gitkeep
git commit -m "feat: Sveltia CMS 관리자 화면 및 콘텐츠 컬렉션 설정"
```

---

### Task 9: GitHub Actions 배포 워크플로

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `npm run build` (Task 1), `dist/` 산출물.
- Produces: `main` push 시 GitHub Pages 자동 배포.

- [ ] **Step 1: 배포 워크플로 작성**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 로컬 빌드로 워크플로 명령 검증**

Run: `npm ci && npm run build`
Expected: 성공(워크플로가 실행하는 명령과 동일).

- [ ] **Step 3: 커밋**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Pages 배포 워크플로"
```

---

### Task 10: 배포 대상 값 확정 + 셋업 가이드

**Files:**
- Modify: `astro.config.mjs` (site/base)
- Modify: `public/admin/config.yml` (repo/base_url)
- Create: `docs/setup/배포-셋업-가이드.md`

**Interfaces:**
- Consumes: 실제 GitHub `owner/repo`, OAuth Worker 도메인(Task 11).

> 이 태스크는 실제 저장소·도메인 값이 필요하므로, 값 미확정 시 가이드 문서까지 작성하고 실제 치환은 배포 시점에 수행한다.

- [ ] **Step 1: astro.config.mjs의 site/base 확정 방법 반영**

프로젝트 페이지 기준 예시로 주석 갱신(값은 배포 시 치환):

```js
// astro.config.mjs — 배포 예시
// 사용자/조직 페이지(<owner>.github.io 저장소): site='https://<owner>.github.io', base='/'
// 프로젝트 페이지(<repo> 저장소):              site='https://<owner>.github.io', base='/<repo>'
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://example.github.io',
  base: '/',
  trailingSlash: 'ignore',
});
```

- [ ] **Step 2: 셋업 가이드 문서 작성**

```markdown
<!-- docs/setup/배포-셋업-가이드.md -->
# 배포 셋업 가이드 (최초 1회)

## 1. GitHub 저장소 생성 및 코드 push
1. GitHub에서 새 저장소 생성 (예: `cau-postplastic-hub`).
2. 로컬에서 remote 연결 후 push:
   ```
   git remote add origin https://github.com/<owner>/<repo>.git
   git push -u origin main
   ```

## 2. GitHub Pages 활성화
- 저장소 → Settings → Pages → Build and deployment → Source: **GitHub Actions**.

## 3. 배포 경로 값 설정
- `astro.config.mjs`
  - 프로젝트 페이지면 `base: '/<repo>'`, 사용자 페이지면 `base: '/'`.
  - `site: 'https://<owner>.github.io'`.
- `public/admin/config.yml`의 `repo: <owner>/<repo>`.

## 4. OAuth Worker 배포
- `oauth-worker/README.md` 참고. 배포 후 얻은 도메인을 `public/admin/config.yml`의 `base_url`에 입력.

## 5. 담당자 GitHub 계정 협업자 추가
- 저장소 → Settings → Collaborators → 담당자 계정 추가(Write 권한).
- 이 계정만 `/admin`에서 발행 가능 → "관리자만 등록" 보장.

## 6. 확인
- `https://<owner>.github.io/<repo>/` 접속.
- `.../admin`에서 로그인·테스트 글 발행·삭제 리허설.
```

- [ ] **Step 3: 커밋**

```bash
git add astro.config.mjs docs/setup/배포-셋업-가이드.md
git commit -m "docs: 배포 대상 값 확정 방법 및 셋업 가이드"
```

---

### Task 11: GitHub OAuth Cloudflare Worker

**Files:**
- Create: `oauth-worker/src/index.js`
- Create: `oauth-worker/wrangler.toml`
- Create: `oauth-worker/README.md`

**Interfaces:**
- Produces: Sveltia/Decap GitHub 백엔드가 사용하는 OAuth 콜백 엔드포인트(`/auth`, `/callback`). `config.yml`의 `base_url`이 이 Worker를 가리킨다.

- [ ] **Step 1: Worker 소스 작성 (GitHub OAuth 핸드셰이크)**

```js
// oauth-worker/src/index.js
// Decap/Sveltia CMS 호환 GitHub OAuth 핸들러.
// 환경변수(Secrets): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
const html = (msg) => `<!doctype html><html><body><script>
(function(){
  function send(){ window.opener && window.opener.postMessage('authorization:github:${msg.status}:${JSON.stringify(msg.content)}', '*'); }
  window.addEventListener('message', function(){ send(); }, {once:true});
  send();
})();
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') {
      const redirect = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${encodeURIComponent(url.origin + '/callback')}`;
      return Response.redirect(redirect, 302);
    }
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const data = await tokenRes.json();
      const status = data.access_token ? 'success' : 'error';
      const content = data.access_token ? { token: data.access_token, provider: 'github' } : { error: data.error || 'no token' };
      return new Response(html({ status, content }), { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('CMS OAuth worker', { status: 200 });
  },
};
```

- [ ] **Step 2: wrangler.toml 작성**

```toml
# oauth-worker/wrangler.toml
name = "cau-cms-oauth"
main = "src/index.js"
compatibility_date = "2024-11-01"
```

- [ ] **Step 3: Worker 배포 가이드 작성**

```markdown
<!-- oauth-worker/README.md -->
# CMS OAuth Worker (최초 1회)

## 1. GitHub OAuth App 등록
- GitHub → Settings → Developer settings → OAuth Apps → New.
- Homepage URL: 사이트 주소.
- Authorization callback URL: `https://<worker-domain>/callback` (배포 후 확정).
- 생성된 Client ID / Client Secret 보관.

## 2. Worker 배포
```
cd oauth-worker
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler deploy
```
- 배포 후 출력된 Worker 도메인을 확인.

## 3. 값 연결
- OAuth App의 callback URL을 `https://<worker-domain>/callback`으로 갱신.
- `public/admin/config.yml`의 `base_url: https://<worker-domain>`.

## 4. 확인
- 사이트 `.../admin` 접속 → "GitHub로 로그인" → 정상 로그인되면 완료.
```

- [ ] **Step 4: Worker 문법 검증**

Run: `node --check oauth-worker/src/index.js`
Expected: 에러 없음(문법 정상).

- [ ] **Step 5: 커밋**

```bash
git add oauth-worker/
git commit -m "feat: GitHub OAuth Cloudflare Worker 및 배포 가이드"
```

---

### Task 12: 담당자용 한글 매뉴얼 + 최종 검증

**Files:**
- Create: `docs/manual/관리자-매뉴얼.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: 전체 시스템(Task 1~11).

- [ ] **Step 1: 담당자 매뉴얼 작성**

```markdown
<!-- docs/manual/관리자-매뉴얼.md -->
# 담당자 매뉴얼 — 글 올리는 법

> 개발 지식이 없어도 됩니다. 아래 순서만 따라 하세요.

## 1. 관리자 화면 접속
- 브라우저에서 `사이트주소/admin` 을 엽니다. (예: `https://<owner>.github.io/<repo>/admin`)

## 2. 로그인
- **[GitHub로 로그인]** 버튼을 클릭합니다.
- 처음 한 번은 권한 승인 창이 뜹니다 → 승인합니다.

## 3. 글 작성
1. 왼쪽에서 게시판 선택: **공지사항 / 이슈·뉴스 / 전문정보**.
2. 오른쪽 위 **[New ...]**(새 글) 클릭.
3. 제목, 날짜, 분류를 입력합니다.
4. 본문을 워드처럼 작성합니다. 이미지·첨부는 해당 칸에서 업로드합니다.
5. 완료되면 **[Publish] → [Publish now]** 를 클릭합니다.

## 4. 반영 확인
- 발행 후 **약 1분** 뒤 실제 사이트에 나타납니다.
- 새로고침해도 안 보이면 1~2분 더 기다렸다가 확인하세요.

## 5. 수정 / 삭제
- 게시판에서 해당 글을 클릭 → 수정 후 다시 **Publish**.
- 삭제는 글 화면의 **[Delete]** 를 사용합니다.

## 6. 임시저장
- 아직 공개하고 싶지 않으면 **임시저장** 항목을 체크하고 발행하세요. 사이트에 보이지 않습니다.

## 자주 묻는 질문
- **로그인이 안 돼요**: 저장소 담당자(협업자)로 등록된 GitHub 계정인지 확인하세요.
- **글이 안 보여요**: 임시저장 체크를 해제했는지, 1~2분 지났는지 확인하세요.
```

- [ ] **Step 2: README.md 작성**

```markdown
# 중앙대학교 포스트 플라스틱 허브

Astro + Sveltia CMS 기반 정적 콘텐츠 사이트. GitHub Pages 무료 호스팅, DB·회원가입 없음, 관리자만 웹에서 콘텐츠 등록.

## 개발
```
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 정적 빌드 → dist/
npm test         # 유닛 테스트
```

## 문서
- 설계: `docs/superpowers/specs/2026-07-16-cau-postplastic-hub-design.md`
- 배포 셋업: `docs/setup/배포-셋업-가이드.md`
- OAuth Worker: `oauth-worker/README.md`
- 담당자 매뉴얼: `docs/manual/관리자-매뉴얼.md`
```

- [ ] **Step 3: 전체 검증 (빌드 + 전체 테스트)**

Run: `npm run build && npm test`
Expected: 빌드 성공, 모든 테스트 PASS(posts 4개 + build 산출물 전체).

- [ ] **Step 4: 커밋**

```bash
git add docs/manual/관리자-매뉴얼.md README.md
git commit -m "docs: 담당자 한글 매뉴얼 및 README"
```

---

## Self-Review Notes

**Spec coverage 확인**
- 스택(Astro/Sveltia/Pages/Actions/OAuth) → Task 1,8,9,11 ✓
- 메뉴(홈/About/공지/뉴스/자료) → Task 4,5,6 ✓
- 콘텐츠 데이터 모델(스키마·필드) → Task 2, CMS 필드 Task 8 ✓
- 관리자 흐름(GitHub 로그인→작성→발행) → Task 8,11, 매뉴얼 Task 12 ✓
- 권한 통제(협업자만) → Task 10 셋업 가이드 ✓
- 오류 처리(빈 상태/필수필드/썸네일 대체/404/빌드 실패) → PostList 빈 상태(Task 4), 스키마(Task 2), placeholder(Task 4), 404(Task 7) ✓
- 배포(Actions·base 경로) → Task 9,10, `withBase`(Task 1) ✓
- 테스트(빌드·링크·유닛) → Task 3,7,12 ✓
- 전달물(매뉴얼·셋업 가이드) → Task 10,11,12 ✓
- 범위 밖(게시판/다국어/검색) → 계획에 미포함 ✓

**Type 일관성**: `PostLike`/`withBase`/`PostCard`/`PostList` 시그니처가 정의 태스크와 소비 태스크에서 일치. CMS `config.yml` `options` 값이 `content.config.ts` Zod enum과 일치(공지/세미나/행사, 정책/보고서/인터뷰/채용, 논문/자료/인턴십).

**Placeholder 스캔**: `OWNER/REPO`, `OAUTH-WORKER-DOMAIN`은 실제 배포 값(TODO 아님) — Global Constraints·Task 10에서 확정 방식 명시.
