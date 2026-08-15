# 개설 교과목 페이지 설계

작성일: 2026-08-15

## 배경

헤더의 `e-class` 버튼은 현재 중앙대(`eclass3.cau.ac.kr`)·금오공대(`lms.kumoh.ac.kr`) 두 개의 외부 링크를 드롭다운으로 노출한다. 학생 입장에서는 "어떤 과목이 어느 학교에서 열리는지" 모른 채 학교부터 고르게 되어 순서가 뒤집혀 있다. 학기별 개설 교과목 목록을 먼저 보여주고, 과목을 고르면 해당 학교 e-class로 연결한다.

## 범위

- 신규 페이지 `/courses` — 학기별 개설 교과목 목록
- 헤더 `e-class` 버튼을 `/courses`로 가는 단일 링크로 교체 (라벨 유지)
- 모바일 햄버거 메뉴에 포털 링크 노출

기존 `/program`(교육과정)은 트랙별 교과 편성표로 성격이 다르므로 건드리지 않는다.

## 데이터 — `src/consts.ts`

기존 `TRACKS`와 동일하게 코드 상수로 관리한다. CMS 연동은 하지 않는다(학기당 1~2회 갱신, 데이터 규모 작음).

```ts
export const ECLASS = {
  '중앙대학교': 'https://eclass3.cau.ac.kr',
  '국립금오공과대학교': 'https://lms.kumoh.ac.kr',
} as const;

export type OpenCourse = {
  nameKo: string;
  nameEn: string;
  professor: string;
  univ: keyof typeof ECLASS;
};
export type SemesterCourses = { semester: string; courses: OpenCourse[] };
export const OPEN_COURSES: SemesterCourses[];
```

학교 → e-class URL 매핑을 `ECLASS` 한 곳에 모아 두어 학교가 추가돼도 데이터만 늘리면 된다. `univ` 필드가 `ECLASS`의 키 타입이므로 오타는 타입 에러로 잡힌다.

### 초기 데이터 (2026학년도)

| 학기 | 교과목 | 교수 | 개설학교 |
|---|---|---|---|
| 2026-1학기 | 반응공학특론 / Advanced Chemical Reaction Engineering | 안솔 | 중앙대학교 |
| 2026-1학기 | 고분자재료화학 / Polymer Materials Chemistry | 박주현 | 중앙대학교 |
| 2026-1학기 | 폐플라스틱 재활용 및 자원화 기술 / Resource cycle and Circular Economy | 정현민 | 국립금오공과대학교 |
| 2026-1학기 | 플라스틱 정책 공학 / Plastic Policy Engineering | 이성규 | 국립금오공과대학교 |
| 2026-2학기 | 폐플라스틱 재활용 및 자원화 기술 / Resource cycle and Circular Economy | 유영재 | 중앙대학교 |
| 2026-2학기 | 탈플라스틱 전과정 이해 / Introduction to AI and Big Data for the Circular Economy | 이창연 | 중앙대학교 |
| 2026-2학기 | 산학연계 캡스톤 프로젝트 / Industry-Academia Cooperation Capstone Project | 송인호 | 중앙대학교 |
| 2026-2학기 | 적층제조특론 / Advanced Additive Manufacturing | 배진혜 | 중앙대학교 |
| 2026-2학기 | 계면현상특론 / Advanced Interfacial Phenomena | 장석태 | 중앙대학교 |
| 2026-2학기 | 고급박막공학 / Advanced Thin-Film Engineering | 김선주 | 중앙대학교 |
| 2026-2학기 | 전달현상특론 / Advanced Transport Phenomena | 송인호 | 중앙대학교 |
| 2026-2학기 | 화공수학특론 / Advanced Chemical Engineering Mathematics | 이창연 | 중앙대학교 |
| 2026-2학기 | 탈플라스틱 전과정 이해 / Introduction to AI and Big Data for the Circular Economy | 김형준 | 국립금오공과대학교 |
| 2026-2학기 | 플라스틱 규제와 대응방법론 / Plastic Regulation and Management Strategies | 엄태준 | 국립금오공과대학교 |
| 2026-2학기 | 융합형 소재 설계 / Integrated Materials Design | 정현민 | 국립금오공과대학교 |

원문 표에서 `탈플라스틱 전과정 이해`와 `폐플라스틱 재활용 및 자원화 기술`의 영문명이 한글명과 어긋나 보이나, 담당자가 제공한 원본 그대로 반영한다.

## 페이지 — `src/pages/courses.astro`

- `BaseLayout` + `PageHeader`(eyebrow `Courses`, 제목 `개설 교과목`) — `/program`과 동일한 패턴
- 학기별 섹션. 각 섹션 헤딩은 학기명 + 과목 수
- 표 3열: **교과목 / 교수 / 개설학교**
  - 교과목 셀: 한글명(굵게) + 영문명(작은 회색 글씨) 2줄
  - 개설학교 셀: 대학명 + 외부링크 아이콘
- **행 전체가 링크**. 클릭 시 `ECLASS[univ]`로 새 탭 이동(`target="_blank" rel="noopener noreferrer"`). 호버 시 행 배경 강조로 클릭 가능함을 표시
- 표 스타일은 `/program`의 `.grad-table` 규칙을 따르고, ≤640px에서 카드형으로 전환해 가로 스크롤을 없앤다
- 하단에 안내 문구: 수강신청 일정은 각 대학 학사일정 참고

### 접근성

- 행 링크는 `<a>`로 감싸되 표 구조를 유지하기 위해 `display: contents`가 아닌, 각 셀 안에 링크를 두는 대신 `<tr>` 내부 첫 셀에 링크를 두고 `::after` 오버레이로 행 전체를 클릭 영역으로 확장한다(`position: relative`인 `<tr>` 기준).
- 링크 텍스트는 과목명이므로 스크린리더에서 의미가 통한다. 외부 링크임을 `aria-label`로 명시한다.
- `:focus-visible` 아웃라인 유지.

## 헤더 — `src/components/Header.astro`

`PORTALS` 배열을 두 형태로 확장한다.

```ts
type Portal =
  | { label: string; href: string }                    // 단일 링크
  | { label: string; links: { label: string; href: string }[] };  // 드롭다운
```

- `학교포탈` — 기존 드롭다운 유지
- `e-class` — 라벨 그대로, `withBase('/courses')`로 가는 단일 링크. caret 아이콘 없음

### 모바일

`.portals`는 ≤980px에서 숨겨지므로, 햄버거 드로어(`.site-nav`) 하단에 구분선과 함께 포털 링크를 노출한다. 드롭다운은 모바일에서 평면 목록(`학교포탈 · 중앙대` 형태)으로 펼쳐 보여준다. `.nav-toggle:checked ~ .site-nav`의 `max-height`를 늘어난 항목 수에 맞게 조정한다.

## 이용자 정보 입력 (2026-08-15 추가)

교과목 목록을 보기 전에 **학교·학번·이름**을 입력받고, 입력 시각과 함께 구글 스프레드시트에 기록한다.

### 이것은 인증이 아니다

정적 사이트라 교과목 목록 HTML은 페이지 소스에 그대로 포함된다. 폼을 우회하려면 우회할 수 있다. **접근 차단이 아니라 이용 기록 수집**으로만 동작하며, 이 전제는 담당자와 합의된 사항이다.

### 흐름

```
폼(학교·학번·이름) ──제출──▶ Apps Script POST ──▶ 구글시트 행 추가
                                    │
                                    └──▶ 교과목 목록 표시
```

목록은 서버 렌더링해 두고 `hidden`으로 감췄다가 제출 시 노출한다. 매번 입력받으므로 localStorage는 쓰지 않는다.

### 전송

Apps Script 웹앱은 CORS preflight를 처리하지 못하므로 `Content-Type: text/plain`으로 보내 "simple request"가 되게 한다. CORS로 응답을 읽지 못하면 `mode: 'no-cors'`로 한 번 더 시도한다 — 응답은 못 읽어도 기록은 남는다.

**실패 시**: 인증이 아니므로 학생을 막지 않는다. 인라인 에러와 함께 `건너뛰고 목록 보기` 버튼을 노출한다.

**엔드포인트**는 `src/consts.ts`의 `COURSE_LOG_ENDPOINT` 상수. 빈 문자열이면 기록 없이 폼이 통과하므로, Apps Script 배포 전에도 페이지가 정상 동작한다.

### 시트

컬럼: **기록시각 / 학교 / 학번 / 이름**. 기록시각은 Apps Script의 서버 시각을 쓴다 — 클라이언트 시각은 조작 가능하고 기기 시계에 좌우된다.

Apps Script 코드와 배포 절차는 `docs/setup/교과목-접속기록-구글시트-연동.md`.

### 개인정보

담당자 결정으로 수집·이용 동의 절차는 두지 않는다. 필요해지면 폼에 안내문과 체크박스를 추가하면 되도록 구조를 열어 둔다.

## 수강기간 제한 (2026-08-15 추가)

학기마다 수강 가능 기간을 두고, 기간 밖에서 교과목을 클릭하면 e-class로 이동하지 않고 안내 팝업을 띄운다.

| 학기 | 수강기간 (시작·종료일 포함) |
|---|---|
| 2026-1학기 | 2026.03.01 ~ 2026.06.30 |
| 2026-2학기 | 2026.08.01 ~ 2027.01.31 |

`SemesterCourses`에 `openFrom` / `openTo`(`'YYYY-MM-DD'`)를 둔다.

### 판정은 클라이언트에서, 한국 시각으로

정적 빌드라 서버에서 미리 계산하면 시간이 지나며 값이 낡는다. 따라서 브라우저에서 판정한다.

학사일정은 한국 시각 기준이므로 접속 기기의 표준시와 무관해야 한다. `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })`로 오늘 날짜를 `'YYYY-MM-DD'`로 얻어 ISO 문자열끼리 비교한다 — 시간대 산술 없이 양끝 포함 비교가 그대로 성립한다.

판정 결과는 `.sem[data-open="true|false"]`로 표시하고 스타일은 CSS가 받는다.

**한계**: 기기 시계에 의존하므로 사용자가 시계를 바꾸면 우회된다. 정적 사이트에 신뢰할 수 있는 시각 출처가 없어 감수하는 제약이며, 이 페이지는 애초에 접근 차단이 아니라 안내·기록 목적이다.

### 기간 외 동작

수강기간은 **화면에 표시하지 않는다**. 목록은 기간과 무관하게 동일하게 보이고, 기간 여부는 `data-open`으로만 들고 있다가 클릭 시점에 알린다.

- 링크에서 `href`·`target`을 제거한다. 새 탭 열기·가운데 클릭·컨텍스트 메뉴까지 전부 막기 위함이며, `preventDefault`만으로는 이 경로들이 열린다.
- 대신 `role="button"` + `tabindex="0"`을 주어 키보드로도 안내 팝업에 닿게 한다. Enter/Space는 `href` 없는 `<a>`에서 `click`을 발생시키지 않으므로 `keydown`으로 따로 처리한다.
- `aria-disabled`는 쓰지 않는다. 비활성 컨트롤이 아니라 사유를 알려주는 버튼이고, '비활성'으로 안내되면 보조기술 사용자가 눌러볼 이유를 잃는다.
- 팝업은 네이티브 `<dialog>` + `showModal()` — 포커스 가둠과 Esc 닫기를 브라우저가 처리한다. 본문에 해당 학기의 실제 수강기간을 적어 "언제 되는지"까지 알려준다.

## 검증

- `npm run build` 통과, `dist/courses/index.html` 생성 확인
- 표의 모든 행 링크가 학교에 맞는 e-class URL을 가리키는지 확인
- 데스크톱/모바일 폭에서 헤더 e-class 진입 경로 확인
- Playwright로 폼 동작 확인: 초기 상태(폼 노출·목록 숨김), 엔드포인트 미설정 시 통과, 설정 시 payload 전송(앞뒤 공백 제거), 빈 값 제출 차단, 전송 실패 시 에러·건너뛰기 동작
- Playwright로 수강기간 확인: 시계를 고정하고 시작일·종료일·그 다음날 등 7개 경계 시점 판정, 기기 표준시를 `America/New_York`으로 두어도 KST 기준으로 판정되는지, 기간 외 클릭 시 팝업 표시·새 탭 미개방·주소 미이동, 기간 내 클릭 시 정상 이동
