import { backendFetch } from "@/shared/api/backend";

import type { LoginResponse, MyUserInfo } from "./types";

/**
 * 로그인 직후 보낼 곳(로그인 콜백 라우트에서 쓴다).
 * - 온보딩 완료 → 홈
 * - 약관 동의 전(첫 로그인) → 로그인 화면의 약관 시트
 * - 약관만 동의 → 온보딩
 * 로그인 응답에는 약관 동의 여부가 없어서, 방금 받은 토큰으로 내 정보를 한 번 조회한다.
 * (쿠키는 응답에 실어 보내는 중이라 아직 읽을 수 없다)
 */
export async function afterLoginPath(login: LoginResponse): Promise<string> {
  if (login.onboarded) return "/";
  const me = await backendFetch<MyUserInfo>("/users/me", {
    auth: false,
    headers: { Authorization: `Bearer ${login.accessToken}` },
  });
  // 조회에 실패하면 온보딩으로 보낸다. 온보딩 가드가 약관 동의 여부를 다시 확인한다.
  if (me.ok && !me.data.termsAgreed) return "/login?step=terms";
  return "/onboarding";
}
