// src/consts.ts
export const SITE = {
  title: '중앙대학교 포스트 플라스틱 허브',
  shortTitle: 'CAU 포스트 플라스틱',
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
