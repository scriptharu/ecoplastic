// src/consts.ts
export const SITE = {
  title: '중앙대학교 포스트 플라스틱 허브',
  shortTitle: 'CAU 포스트 플라스틱',
  tagline: '탈플라스틱·순환경제 인재양성 플랫폼',
  description: '탈플라스틱·순환경제 인재양성 플랫폼 (중앙대학교)',
  contact: '서울특별시 동작구 흑석로 84 중앙대학교',
  email: 'contact@example.ac.kr',
};

export type NavItem = { label: string; href: string };

export const NAV: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: '공지사항', href: '/notices' },
  { label: '이슈·뉴스', href: '/news' },
  { label: '전문정보', href: '/resources' },
];

// 홈 통계 (배포 시 담당자가 실제 수치로 교체)
export type Stat = { value: number; suffix?: string; label: string };
export const STATS: Stat[] = [
  { value: 17, label: '참여 교수진' },
  { value: 27, label: '참여 대학원생' },
  { value: 10, label: '협력 기업', suffix: '+' },
  { value: 3, label: '융합 연구팀' },
];

// AI 기반 3대 전략 (참조 사이트 STRATEGY 01–03 구성)
export type Strategy = { no: string; title: string; desc: string };
export const STRATEGIES: Strategy[] = [
  {
    no: '01',
    title: '친환경 대체소재 예측',
    desc: '생성형 AI로 생분해성·재활용 대체소재의 물성과 시장성을 예측하여 연구 방향을 제시합니다.',
  },
  {
    no: '02',
    title: '소비자 행동 개인화',
    desc: '데이터 분석을 통해 탈플라스틱 소비 행동을 개인화하여 실질적인 감축을 유도합니다.',
  },
  {
    no: '03',
    title: '기업 ESG 전략 최적화',
    desc: '순환경제 관점에서 기업의 ESG 전략을 진단·최적화하고 산학 협력을 연결합니다.',
  },
];
