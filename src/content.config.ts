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
