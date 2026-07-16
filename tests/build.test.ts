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
