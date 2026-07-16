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
