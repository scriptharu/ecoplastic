// astro.config.mjs
// 프로젝트 페이지 배포: https://scriptharu.github.io/ecoplastic/
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://scriptharu.github.io',
  base: '/ecoplastic/',
  trailingSlash: 'ignore',
});
