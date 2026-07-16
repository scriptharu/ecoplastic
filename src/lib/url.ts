// src/lib/url.ts
// GitHub Pages 프로젝트 페이지의 base 경로를 모든 내부 링크에 안전하게 적용.
export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env.BASE_URL; // 예: '/' 또는 '/repo/'
  const joined = `${base}/${path}`.replace(/\/{2,}/g, '/');
  return joined === '' ? '/' : joined;
}
