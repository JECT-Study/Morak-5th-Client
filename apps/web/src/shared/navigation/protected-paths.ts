/**
 * 로그인해야 들어올 수 있는 페이지(/admin은 운영진 검수, ADMIN 여부는 API가 판단).
 * 그 외(홈·챌린지 목록 등)는 비로그인도 볼 수 있다.
 * proxy(페이지 요청)와 LoginRedirect(링크 미리 불러오기로 열린 화면)가 같은 목록을 쓴다.
 */
export const PROTECTED_PATHS = ["/challenges/new", "/settings", "/my/points", "/my/edit", "/admin"];

export const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
