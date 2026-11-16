import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { LoginResponse } from "@/features/auth/types";
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "@/shared/api/auth-cookies";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 액세스 토큰 재발급. 브라우저의 request(shared/api/client)가 401을 받으면 부른다.
 * refresh_token 쿠키는 path가 /api/auth라 이 경로에만 실린다.
 * 백엔드는 리프레시 토큰을 한 번 쓰면 폐기(rotation)하므로, 응답의 새 토큰으로 두 쿠키를 모두 교체한다.
 */
export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
      },
      { status: 401 },
    );
  }

  const result = await backendFetch<LoginResponse>("/auth/refresh", {
    method: "POST",
    auth: false,
    json: { refreshToken },
  });

  if (!result.ok) {
    // 만료·폐기(AUTH_007), 탈퇴(AUTH_003) → 백엔드 에러를 그대로 내려주고 남은 쿠키를 정리한다.
    const response = toRouteResponse(result);
    clearAuthCookies(response);
    return response;
  }

  // 토큰은 httpOnly 쿠키로만 주고, 본문에는 온보딩 여부만 내려준다(JS에 토큰을 노출하지 않는다).
  const response = toRouteResponse({
    ok: true,
    status: result.status,
    data: { onboarded: result.data.onboarded },
  });
  setAuthCookies(response, result.data);
  return response;
}
