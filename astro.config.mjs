// astro.config.mjs — 배포 예시
// 사용자/조직 페이지(<owner>.github.io 저장소): site='https://<owner>.github.io', base='/'
// 프로젝트 페이지(<repo> 저장소):              site='https://<owner>.github.io', base='/<repo>'
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.github.io',
  base: '/',
  trailingSlash: 'ignore',
});
