import { cookies } from "next/headers";

import { REFRESH_TOKEN_COOKIE, clearAuthCookies } from "@/shared/api/auth-cookies";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 로그아웃. refresh_token 쿠키는 path가 /api/auth라 이 경로에만 실린다.
 * 백엔드(POST /auth/logout)에 리프레시 토큰을 폐기하게 하고, 결과와 관계없이 쿠키를 지운다.
 * 백엔드가 실패해도(서버 꺼짐 등) 이 기기에서는 로그아웃돼야 하므로 항상 성공으로 답한다.
 */
export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    await backendFetch<Record<string, never>>("/auth/logout", {
      method: "POST",
      auth: false,
      json: { refreshToken },
    });
  }

  const response = toRouteResponse({ ok: true, status: 200, data: {} });
  clearAuthCookies(response);
  return response;
}
