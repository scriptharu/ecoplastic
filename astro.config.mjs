// astro.config.mjs
import { defineConfig } from 'astro/config';

// 배포 시 확정: 프로젝트 페이지면 site='https://<owner>.github.io', base='/<repo>'
export default defineConfig({
  site: 'https://example.github.io',
  base: '/',
  trailingSlash: 'ignore',
});
