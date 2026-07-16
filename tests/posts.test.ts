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
