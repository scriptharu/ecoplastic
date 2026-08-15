// src/consts.ts
export const SITE = {
  title: '환경분야 탈플라스틱 특성화대학원',
  shortTitle: '환경분야 탈플라스틱 특성화대학원',
  tagline: '중앙대학교·국립금오공과대학교 환경분야 특성화대학원',
  description:
    '탈플라스틱 전주기 전문인력을 양성하는 중앙대학교·국립금오공과대학교 공동 특성화대학원 — 소재·공정·정책·스마트기술을 아우르는 융합 교육 플랫폼',
};

export type NavItem = { label: string; href: string };

export const NAV: NavItem[] = [
  { label: '사업소개', href: '/about' },
  { label: '교육과정', href: '/program' },
  { label: '공지사항', href: '/notices' },
  { label: '이슈·뉴스', href: '/news' },
  { label: '전문정보', href: '/resources' },
];

// 홈 통계 — 사업계획서 최종/정량 목표 (배포 시 담당자가 실제 실적으로 갱신)
export type Stat = { value: number; suffix?: string; label: string };
export const STATS: Stat[] = [
  { value: 135, suffix: '명', label: '전문인력 양성 목표' },
  { value: 5, label: '융합기술 트랙' },
  { value: 2, label: '거점 대학' },
  { value: 19, suffix: '개+', label: '참여 기업' },
];

// 5개 융합기술 트랙 (사업계획서 기준)
// 교과목 (사업계획서 45~49p "전체 교과목 개설계획(총괄)" 편성표 기준)
export type Course = {
  name: string;
  type: '공통' | '전선';
  credits: number | null; // 학점, 원문 미표기 시 null → "-" 표시
  period: string; // 개설시기
  desc: string; // 교육내용
};
export type CourseGroup = { group: string; courses: Course[] };
export type Track = { no: string; title: string; univ: string; desc: string; courses: CourseGroup[] };

// 공통 전공기초(전필) — 전 트랙 공통 이수 (사업계획서 원문과 동일하게 각 트랙에 반복 수록)
const CORE_COURSES: Course[] = [
  {
    name: '폐플라스틱 재활용 및 자원화 기술',
    type: '공통',
    credits: 3,
    period: '매년 1학기',
    desc: '플라스틱의 특성과 유해성, 폐플라스틱의 회수·재활용 기술, 대체 소재 및 AI 활용 등 자원순환 관련 전반적인 핵심 내용을 학습',
  },
  {
    name: '탈플라스틱 전과정 이해',
    type: '공통',
    credits: 3,
    period: '매년 2학기',
    desc: '폐플라스틱의 전 생애주기를 기준으로 재활용·에너지화·융합 자원화 기술의 필요성, 원리, 차이점, 적용 사례 등을 체계적으로 학습',
  },
];

// 공통 실무 캡스톤(전필) — 전 트랙 공통
const CAPSTONE: Course = {
  name: '산학연계 캡스톤 프로젝트',
  type: '공통',
  credits: 3,
  period: '매년 2학기',
  desc: '실제 산업 문제를 기반으로 순환형 플라스틱 소재 설계·공정 개선 프로젝트 수행',
};

export const TRACKS: Track[] = [
  {
    no: '01',
    title: '재료·대체소재',
    univ: '중앙대학교',
    desc: '바이오 기반·기능성·생분해성 고분자를 합성부터 물성 평가, 응용 설계까지 전주기로 다루며 규제 대응형 신소재를 개발합니다.',
    courses: [
      { group: '전공기초', courses: CORE_COURSES },
      {
        group: '전공심화Ⅰ',
        courses: [
          { name: '첨단소재구조론', type: '전선', credits: 3, period: '1·3·5차년도 1학기', desc: '재활용 플라스틱의 구조 변화와 재가공 메커니즘, 업사이클링 복합소재의 미세구조–물성 관계 분석 등을 학습' },
          { name: '고분자유기화학특론', type: '전선', credits: 3, period: '1·3·5차년도 2학기', desc: '해중합 등 분자 전환 반응의 기초와 기능성 단량체 설계 개념을 학습' },
          { name: '첨단소재 열역학 특론', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '재료 시스템의 상평형·상변화 등 열역학 핵심 개념 정립 및 순환자원화 소재 설계를 위한 다상·다성분 열역학 해석' },
        ],
      },
      {
        group: '전공심화Ⅱ',
        courses: [
          { name: '플라스틱 재활용 공학', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '폐플라스틱의 분류·전처리·재가공 공정과 기계·화학적 전환 메커니즘을 규정하는 핵심 원리를 학습' },
          { name: '생분해성 소재공학', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '생분해성 고분자의 분해 메커니즘, 구조–물성 제어 전략, 응용을 위한 설계 기준을 학습' },
          { name: '첨단소재산업과 기술혁신', type: '전선', credits: 3, period: '5차년도 1학기', desc: '첨단소재 산업의 기술혁신 동향을 기반으로 순환형 플라스틱 소재 생산·가공 기술의 산업 적용 사례를 학습' },
          { name: '나노응용 소자공학', type: '전선', credits: 3, period: '5차년도 2학기', desc: '재활용 고분자 기반 나노소자의 전기적·기계적 특성을 활용한 고기능 응용 설계 원리를 학습' },
          { name: '바이오 고분자 공학', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '생체 유래 단량체의 중합·구조 제어, 생분해 과정의 독성·적합성 평가, 바이오 기반 대체소재의 제조·응용 원리를 학습' },
          { name: '친환경 소재 응용 기술', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '친환경 소재의 특성, 공정·가공 기술, 응용 분야별 적용 원리를 탐색' },
        ],
      },
      { group: '실무', courses: [CAPSTONE] },
    ],
  },
  {
    no: '02',
    title: '재활용·자원화 공정',
    univ: '중앙대학교',
    desc: '기계적·화학적 재활용, 열분해, 단량체 회수 등 자원순환 핵심 공정을 분리·선별부터 공정 최적화·성능 평가까지 실습합니다.',
    courses: [
      { group: '전공기초', courses: CORE_COURSES },
      {
        group: '전공심화Ⅰ',
        courses: [
          { name: '화학공학특론', type: '전선', credits: 3, period: '1·3·5차년도 1학기', desc: '폐플라스틱 전환·정제·재가공 공정의 반응·분리·유동 특성을 규정하는 화학공학적 원리를 분석' },
          { name: '반응공학특론', type: '전선', credits: 3, period: '1·3·5차년도 2학기', desc: '폐플라스틱 열분해·해중합·가스화 등 전환 공정의 반응 속도·메커니즘·설계 원리를 분석' },
          { name: '고분자재료화학', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '고분자의 구조·물성·반응 특성 및 기능 향상 기초 이해와 폐플라스틱 재활용·재가공 시 구조·성능 변화와 설계' },
        ],
      },
      {
        group: '전공심화Ⅱ',
        courses: [
          { name: '고분자 자원화 기술', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '폐플라스틱의 전환·업사이클링·고부가 자원화 공정의 반응·분리·재가공 메커니즘을 탐색' },
          { name: '친환경 에너지디자인', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '폐플라스틱 전환·활용을 포함한 지속가능 에너지 시스템의 소재 선택·공정 설계·성능 최적화 원리를 탐색' },
          { name: '고분자나노하이브리드재료', type: '전선', credits: 3, period: '3·5차년도 1학기', desc: '폐플라스틱 기반 나노보강·기능화 공정을 통해 고분자–나노물질 하이브리드의 구조·물성 향상 메커니즘을 분석' },
          { name: '적층제조특론', type: '전선', credits: 3, period: '3·5차년도 2학기', desc: '재활용 플라스틱을 활용한 적층제조 공정의 재료 특성·가공 조건·구조 형성 메커니즘을 분석' },
          { name: '계면현상특론', type: '전선', credits: 3, period: '5차년도 1학기', desc: '젖음·흡착·계면장력 등 계면특성 기반의 분산·안정화 공정 및 소재·코팅·나노입자 계면 제어 전략을 탐색' },
          { name: '고급박막공학', type: '전선', credits: 3, period: '5차년도 2학기', desc: '박막 형성·증착·개질 공정에서의 미세구조–물성 연계를 이해하고, 친환경·저탄소 기반 기능성 박막 소재의 특성 평가 및 응용 설계 개념을 학습' },
        ],
      },
      {
        group: '실무',
        courses: [
          { name: '화학적 재활용 및 단량체 회수', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '폐플라스틱의 화학적 분해·해중합 조건과 단량체 회수·정제 공정의 핵심 원리를 분석' },
          CAPSTONE,
        ],
      },
    ],
  },
  {
    no: '03',
    title: '정책·순환시스템',
    univ: '국립금오공과대학교',
    desc: '국내외 플라스틱 규제와 순환경제 정책, 전과정평가(LCA)를 기반으로 규제 대응·ESG·국제 인증 역량을 갖춘 정책·기술 융합 인재를 양성합니다.',
    courses: [
      { group: '전공기초', courses: CORE_COURSES },
      {
        group: '전공심화Ⅰ',
        courses: [
          { name: '자원순환 촉매공학특론', type: '전선', credits: 3, period: '1·3·5차년도 1학기', desc: '폐플라스틱 화학적 재활용 공정을 위한 촉매 반응 최적화 및 순환 공정 설계 교육. 저탄소 촉매 기술이 순환경제 시스템의 경제성과 환경 효율에 미치는 영향을 중심으로 학습' },
          { name: '환경공학', type: '전선', credits: 3, period: '1·3·5차년도 2학기', desc: '오염 저감·자원순환을 위한 환경 부하 분석과 처리·관리 시스템의 핵심 원리를 학습' },
          { name: '플라스틱 정책 공학', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '플라스틱의 생산–사용–폐기 흐름을 기반으로 순환경제 정책, 회수·재활용 시스템 설계, 규제·인프라 연계 원리를 분석' },
          { name: '플라스틱 규제와 대응방법론', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '국내외 플라스틱 규제 체계와 산업·기술적 대응 전략의 핵심 원리를 분석' },
        ],
      },
      {
        group: '전공심화Ⅱ',
        courses: [
          { name: '순환시스템공학', type: '전선', credits: 3, period: '3·5차년도 1학기', desc: '폐기물 흐름 분석을 기반으로 회수·선별·재활용 인프라와 순환경제 시스템 설계 원리를 탐색' },
          { name: '고급 순환 촉매 설계 및 응용', type: '전선', credits: 3, period: '3·5차년도 2학기', desc: '폐고분자의 해중합·재중합을 위한 고성능 촉매 설계를 학습하고, 고부가가치 단량체를 회수하는 자원화 공정과 촉매 개발의 LCA 분석 및 환경친화적 공정 설계를 학습' },
          { name: '친환경 공정 기술', type: '전선', credits: 3, period: '5차년도 1학기', desc: '폐자원 회수·정제·분리 기반 재자원화 공정의 저에너지·저오염 설계와 자원 효율 향상 및 탈플라스틱·저탄소 전환을 위한 공정 개선 방안을 탐색' },
          { name: '순환형 분리 공정 특론', type: '전선', credits: 3, period: '5차년도 2학기', desc: '폐플라스틱 화학적 재활용 중 혼합물에서 고순도 원료를 분리·정제하는 분리막 및 분리 공정 시스템을 학습' },
        ],
      },
      {
        group: '실무',
        courses: [
          { name: '폐플라스틱 전과정평가(LCA)', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '폐플라스틱의 생산–사용–재활용 전 과정에서 환경부하를 평가하고 개선 전략을 도출하는 LCA 핵심 원리를 분석' },
          CAPSTONE,
        ],
      },
    ],
  },
  {
    no: '04',
    title: '스마트 순환기술',
    univ: '중앙대학교',
    desc: 'AI·IoT·빅데이터로 선별·공정 모니터링·품질관리 자동화와 시뮬레이션 기반 공정 최적화를 다루는 디지털 전환형 트랙입니다.',
    courses: [
      { group: '전공기초', courses: CORE_COURSES },
      {
        group: '전공심화Ⅰ',
        courses: [
          { name: '자원순환 인공지능 개론', type: '전선', credits: 3, period: '1·3·5차년도 1학기', desc: '폐플라스틱의 수집·선별·재활용 효율을 높이기 위한 인공지능 기반 데이터 처리·예측 원리를 학습' },
          { name: '환경 데이터 분석 기초', type: '전선', credits: 3, period: '1·3·5차년도 2학기', desc: '폐플라스틱 순환 과정의 데이터 수집·정제·해석을 위한 환경 데이터 분석 기초 원리를 학습' },
        ],
      },
      {
        group: '전공심화Ⅱ',
        courses: [
          { name: '스마트 자원순환 융합기술', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '폐플라스틱 순환 공정의 자동화·지능화를 위한 센서·데이터·AI 융합 기반 기술의 핵심 원리를 분석' },
          { name: '친환경 소재 응용 기술', type: '전선', credits: 3, period: '1·3·5차년도 1학기', desc: '재생·바이오 기반 저탄소 소재의 구조·기능·설계 지표와 성능 평가, 회수·처리 기반 순환경제 대응 고분자·복합소재의 산업 응용을 학습' },
          { name: '소재공학과 AI', type: '전선', credits: 3, period: '1·3·5차년도 2학기', desc: '폐플라스틱 자원화 소재의 구조·공정·특성 예측을 위한 AI 기반 분석·설계 기초 원리를 탐색' },
          { name: '전달현상특론', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '운동량·열·물질 전달의 기초 해석·스케일링과 자원순환 공정 효율 설계를 위한 전달 메커니즘을 분석' },
          { name: '전산고분자과학', type: '전선', credits: 3, period: '3·5차년도 1학기', desc: '폐플라스틱의 구조·반응·전환 공정을 디지털 모델로 예측·해석하기 위한 분자 시뮬레이션 기초 원리를 분석' },
          { name: '에너지변환소재공학', type: '전선', credits: 3, period: '3·5차년도 2학기', desc: '에너지 변환·저장 소재의 구조–물성–성능 연계와 전기화학 메커니즘 기반 순환형 소재 설계 및 탈플라스틱 자원 회수·처리 연계를 탐색' },
          { name: '에너지공학특론', type: '전선', credits: 3, period: '5차년도 1학기', desc: '에너지 저장·변환 기술에 활용되는 재료의 구조·물성·수명 특성을 이해하고 지속가능 에너지 소자 설계에 필요한 공정·성능 평가 원리를 학습' },
          { name: '화공수학특론', type: '전선', credits: 3, period: '5차년도 2학기', desc: '열·물질 전달·반응속도 모델링 기법을 활용해 재활용 공정의 에너지 효율·자원 회수율을 예측·최적화하는 수학적 기초 역량을 학습' },
        ],
      },
      { group: '실무', courses: [CAPSTONE] },
    ],
  },
  {
    no: '05',
    title: '융합형 탈플라스틱',
    univ: '국립금오공과대학교',
    desc: '재료–공정–정책–AI를 아우르는 프로젝트 기반 트랙으로, 산학 공동 캡스톤과 현장 실습을 통해 전주기 문제 해결형 인재를 배출합니다.',
    courses: [
      { group: '전공기초', courses: CORE_COURSES },
      {
        group: '전공심화Ⅰ',
        courses: [
          { name: '플라스틱의 화학적 재활용', type: '전선', credits: 3, period: '1·3·5차년도 1학기', desc: '폐플라스틱의 해중합·전환 반응을 기반으로 소재·공정·촉매 기술을 연계한 화학적 재활용의 핵심 원리를 분석' },
          { name: '복합재료', type: '전선', credits: 3, period: '1·3·5차년도 2학기', desc: '재활용·업사이클링을 위한 복합재료의 구조 설계·계면 제어·성능 향상 메커니즘을 분석' },
          { name: '고급유기화학', type: '전선', credits: 3, period: '2차년도 1학기', desc: '고급 유기반응의 반응성·선택성·기구 기반 구조–반응성 연계와 친환경 합성·고분자 전환 반응 설계를 학습' },
          { name: '고분자합성특론', type: '전선', credits: 3, period: '2차년도 2학기', desc: '지속가능 고분자 개발을 위해 유기고분자의 합성 원리·반응 메커니즘·구조 제어 기법을 다학제적으로 분석' },
          { name: '융합형 소재 설계', type: '전선', credits: 3, period: '2·4차년도 1학기', desc: '재활용 기반 소재의 기능 통합을 위한 구조·조성·공정 연계 설계 원리를 탐색' },
          { name: '생분해성 고분자학', type: '전선', credits: 3, period: '3·5차년도 1학기', desc: '생분해성 고분자의 구조·분해 거동·성능 제어를 활용한 탈플라스틱 대체소재 설계 원리를 분석' },
        ],
      },
      {
        group: '전공심화Ⅱ',
        courses: [
          { name: '지속가능 고분자 소재', type: '전선', credits: 3, period: '2·4차년도 2학기', desc: '재활용·바이오·생분해 기반의 지속가능 고분자의 구조·기능·설계 전략을 탐색' },
          { name: '고급에너지소재화학', type: '전선', credits: 3, period: '3차년도 1학기', desc: '에너지 저장·변환 소자에 활용되는 고급 화학소재의 구조·반응 특성과 최신 연구동향을 이해하고 소재 설계의 기술적 기반을 학습' },
          { name: '바이오 플라스틱 소재학', type: '전선', credits: 3, period: '3·5차년도 2학기', desc: '바이오 기반 고분자의 합성·구조·분해 특성을 활용한 지속가능 플라스틱 대체소재 설계 원리를 학습' },
          { name: '에너지 재료', type: '전선', credits: 3, period: '4차년도 2학기', desc: '유기·무기 에너지소재의 구조와 전하 이동 원리를 이해하고, 배터리·태양전지 등 에너지 저장·변환 소자에 적용되는 소재 설계 기초를 학습' },
          { name: '응용전기화학공정', type: '전선', credits: 3, period: '5차년도 1학기', desc: '전기화학 반응을 활용한 폐플라스틱의 분해·전환·재활용 공정 원리를 이해하고 주요 전기화학 기반 처리기술을 학습' },
          { name: '재료화학공학특론', type: '전선', credits: 3, period: '5차년도 2학기', desc: '플라스틱 전주기를 재료화학공학 관점에서 분석하고 구조–물성–공정 상관성을 기반으로 지속가능 대체소재 설계 원리를 학습' },
          { name: '고분자분해와 안정성', type: '전선', credits: 3, period: '5차년도 2학기', desc: '폐플라스틱 저감·전환을 위한 고분자의 분해 메커니즘과 구조·안정성 조절 원리를 분석' },
        ],
      },
      {
        group: '실무',
        courses: [
          { name: '응용화학세미나', type: '전선', credits: null, period: '2·4차년도 2학기', desc: '화학·고분자 분야 최신 연구동향을 분석하고, 국내외 논문 발표·토론을 통해 연구 기획 및 발표 역량을 강화' },
          CAPSTONE,
        ],
      },
    ],
  },
];

// 교과목 페이지 접속 기록을 받는 Google Apps Script 웹앱 주소.
// 설정 방법: docs/setup/교과목-접속기록-구글시트-연동.md
// 비워두면 기록 없이 폼이 그대로 통과하므로, 배포 전에도 페이지는 정상 동작한다.
export const COURSE_LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzgOM9S-InJeOsp1UNiylOgeJIpCrdGCwm9Oy24NJfBlvXVKa9b5apEKMTXO6r0K3qO/exec';

// 학기별 개설 교과목 — 각 학교의 e-class로 연결 (담당자가 학기마다 갱신)
export const ECLASS = {
  중앙대학교: 'https://eclass3.cau.ac.kr',
  국립금오공과대학교: 'https://lms.kumoh.ac.kr',
} as const;

export type Univ = keyof typeof ECLASS;
export type OpenCourse = { nameKo: string; nameEn: string; professor: string; univ: Univ };
export type SemesterCourses = { semester: string; courses: OpenCourse[] };

export const OPEN_COURSES: SemesterCourses[] = [
  {
    semester: '2026-1학기',
    courses: [
      { nameKo: '반응공학특론', nameEn: 'Advanced Chemical Reaction Engineering', professor: '안솔', univ: '중앙대학교' },
      { nameKo: '고분자재료화학', nameEn: 'Polymer Materials Chemistry', professor: '박주현', univ: '중앙대학교' },
      { nameKo: '폐플라스틱 재활용 및 자원화 기술', nameEn: 'Resource cycle and Circular Economy', professor: '정현민', univ: '국립금오공과대학교' },
      { nameKo: '플라스틱 정책 공학', nameEn: 'Plastic Policy Engineering', professor: '이성규', univ: '국립금오공과대학교' },
    ],
  },
  {
    semester: '2026-2학기',
    courses: [
      { nameKo: '폐플라스틱 재활용 및 자원화 기술', nameEn: 'Resource cycle and Circular Economy', professor: '유영재', univ: '중앙대학교' },
      { nameKo: '탈플라스틱 전과정 이해', nameEn: 'Introduction to AI and Big Data for the Circular Economy', professor: '이창연', univ: '중앙대학교' },
      { nameKo: '산학연계 캡스톤 프로젝트', nameEn: 'Industry-Academia Cooperation Capstone Project', professor: '송인호', univ: '중앙대학교' },
      { nameKo: '적층제조특론', nameEn: 'Advanced Additive Manufacturing', professor: '배진혜', univ: '중앙대학교' },
      { nameKo: '계면현상특론', nameEn: 'Advanced Interfacial Phenomena', professor: '장석태', univ: '중앙대학교' },
      { nameKo: '고급박막공학', nameEn: 'Advanced Thin-Film Engineering', professor: '김선주', univ: '중앙대학교' },
      { nameKo: '전달현상특론', nameEn: 'Advanced Transport Phenomena', professor: '송인호', univ: '중앙대학교' },
      { nameKo: '화공수학특론', nameEn: 'Advanced Chemical Engineering Mathematics', professor: '이창연', univ: '중앙대학교' },
      { nameKo: '탈플라스틱 전과정 이해', nameEn: 'Introduction to AI and Big Data for the Circular Economy', professor: '김형준', univ: '국립금오공과대학교' },
      { nameKo: '플라스틱 규제와 대응방법론', nameEn: 'Plastic Regulation and Management Strategies', professor: '엄태준', univ: '국립금오공과대학교' },
      { nameKo: '융합형 소재 설계', nameEn: 'Integrated Materials Design', professor: '정현민', univ: '국립금오공과대학교' },
    ],
  },
];

// 4대 사업 추진 방향 (사업계획서 II-1 사업내용)
export type Strategy = { no: string; title: string; desc: string };
export const STRATEGIES: Strategy[] = [
  {
    no: '01',
    title: '산업수요 맞춤 교육과정',
    desc: '플라스틱 전주기와 순환경제 트렌드를 반영한 특화 트랙·모듈형 커리큘럼과 전 트랙 공통 AI/데이터 교육을 개발·운영합니다.',
  },
  {
    no: '02',
    title: '실무중심 산학교육',
    desc: '기업 애로기술 기반 산학프로젝트와 인턴십, 현장 전문가 교강사, 산업체 참여 오픈플랫폼으로 현장형 인재를 양성합니다.',
  },
  {
    no: '03',
    title: '산학 네트워크·성과확산',
    desc: '채용·인턴십 박람회, 산학·기술교류회, 채용가이드북 발간을 통해 산학 네트워크를 강화하고 취업으로 연결합니다.',
  },
  {
    no: '04',
    title: '글로벌 국제협력',
    desc: 'UC San Diego·UNSW 등 해외 대학·기관과 국제 인턴십, 공동연구, 복수학위제를 추진해 글로벌 네트워크를 구축합니다.',
  },
];
