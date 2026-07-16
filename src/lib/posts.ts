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
