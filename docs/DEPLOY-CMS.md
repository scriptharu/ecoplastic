# Admin CMS(Sveltia) 배포 설정 가이드

이 사이트의 콘텐츠 관리자(`/admin`)는 **Sveltia CMS**이며, GitHub 저장소에 직접 커밋하는 방식입니다.
편집자가 GitHub 계정으로 로그인해야 하고, 그 로그인(OAuth)에는 작은 **중계 서버**가 필요합니다.

- 저장소: `scriptharu/ecoplastic`
- 사이트: https://scriptharu.github.io/ecoplastic/
- 관리자: https://scriptharu.github.io/ecoplastic/admin/

---

## 진행 현황

- [x] 1. GitHub 저장소 생성 + 코드 푸시
- [x] 2. `astro.config`(site/base), `public/admin/config.yml`(repo/branch) 설정
- [ ] 3. GitHub Pages 활성화
- [ ] 4. GitHub OAuth App 생성 (Client ID·Secret 발급)
- [ ] 5. Cloudflare Worker(OAuth 중계) 배포
- [ ] 6. `config.yml`의 `base_url`에 Worker 주소 기입 + 재배포
- [ ] 7. `/admin` 로그인·글쓰기 테스트

---

## 3단계 — GitHub Pages 활성화

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source**를 **GitHub Actions**로 설정
3. `main`에 푸시가 있으면 `.github/workflows/deploy.yml`이 자동 빌드·배포
4. 몇 분 뒤 https://scriptharu.github.io/ecoplastic/ 접속 확인

---

## 4단계 — GitHub OAuth App 생성

1. GitHub → 우상단 프로필 → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. 아래 값 입력:
   - **Application name**: `Ecoplastic CMS` (자유)
   - **Homepage URL**: `https://scriptharu.github.io/ecoplastic/`
   - **Authorization callback URL**: `https://example.com/callback`
     → 지금은 임시로 아무 값. **5단계에서 Worker 주소가 나오면 `https://<워커주소>/callback`으로 수정**합니다.
3. 생성 후 **Client ID** 확인, **Generate a new client secret**로 **Client Secret** 발급
4. ⚠️ **Client Secret은 절대 채팅에 붙여넣거나 저장소에 커밋하지 마세요.** 5단계 Cloudflare에만 입력합니다.

---

## 5단계 — Cloudflare Worker(OAuth 중계) 배포

Sveltia 공식 중계 서버: https://github.com/sveltia/sveltia-cms-auth

**가장 쉬운 방법 (대시보드):**
1. https://dash.cloudflare.com 가입/로그인 (무료)
2. 위 `sveltia-cms-auth` 저장소 README의 **Deploy to Cloudflare** 버튼 사용,
   또는 **Workers & Pages → Create → Worker**로 코드를 붙여넣어 배포
3. 배포된 Worker의 **Settings → Variables**에 환경변수 추가:
   - `GITHUB_CLIENT_ID` = (4단계 Client ID)
   - `GITHUB_CLIENT_SECRET` = (4단계 Client Secret) — **Encrypt(비밀) 처리**
   - `ALLOWED_DOMAINS` = `scriptharu.github.io`
4. Worker 주소 확인 (예: `https://sveltia-cms-auth.<계정서브도메인>.workers.dev`)

**wrangler(CLI)로 하려면:**
```bash
git clone https://github.com/sveltia/sveltia-cms-auth
cd sveltia-cms-auth
npm install
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put ALLOWED_DOMAINS   # scriptharu.github.io
npx wrangler deploy
```

배포 후:
- 4단계 OAuth App의 **Authorization callback URL**을 `https://<워커주소>/callback`으로 **수정**
- 아래 6단계로

---

## 6단계 — config.yml에 Worker 주소 기입

`public/admin/config.yml`의 `base_url`을 실제 Worker 주소로 교체:

```yaml
backend:
  name: github
  repo: scriptharu/ecoplastic
  branch: main
  base_url: https://sveltia-cms-auth.<계정서브도메인>.workers.dev   # ← 교체
```

커밋 후 `main`에 푸시 → 자동 재배포.

> Worker 주소만 알려주시면 이 파일은 제가 대신 채워 커밋해 드릴 수 있습니다.

---

## 7단계 — 테스트

1. https://scriptharu.github.io/ecoplastic/admin/ 접속
2. **Login with GitHub** → 권한 승인
3. "공지사항·세미나·행사"에서 새 글 작성 → **Publish**
4. 저장소 `src/content/notices/`에 `.md`가 커밋되고, 자동 배포되어 사이트에 반영되는지 확인

---

## 참고

- 편집자는 저장소에 **쓰기 권한(Collaborator)**이 있어야 커밋됩니다. (Settings → Collaborators)
- 업로드 이미지 경로: CMS는 `/uploads`로 저장, 사이트가 렌더 시 `withBase()`로 `/ecoplastic/uploads/`로 변환.
- `noindex` 설정으로 `/admin`은 검색엔진에 노출되지 않습니다.
