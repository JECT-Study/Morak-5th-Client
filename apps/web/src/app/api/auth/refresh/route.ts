import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import type { LoginResponse } from "@/features/auth/types";
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "@/shared/api/auth-cookies";
import { backendFetch, toRouteResponse, type BackendResult } from "@/shared/api/backend";

/**
 * 액세스 토큰 재발급. refresh_token 쿠키는 path가 /api/auth라 이 경로에만 실린다.
 * 백엔드는 리프레시 토큰을 한 번 쓰면 폐기(rotation)하므로, 응답의 새 토큰으로 쿠키를 모두 교체한다.
 * - POST: 브라우저 request(shared/api/client)가 401을 받았을 때. JSON으로 답한다.
 * - GET ?next=경로: proxy가 페이지 진입 때 보낸다. 성공하면 next로, 실패하면 /login으로 리다이렉트한다.
 */

async function reissue(): Promise<BackendResult<LoginResponse>> {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return {
      ok: false,
      status: 401,
      error: { code: "UNAUTHENTICATED", message: "로그인이 필요합니다." },
    };
  }
  return backendFetch<LoginResponse>("/auth/refresh", {
    method: "POST",
    auth: false,
    json: { refreshToken },
  });
}

export async function POST() {
  const result = await reissue();

  if (!result.ok) {
    // 만료·폐기(AUTH_007), 탈퇴(AUTH_003), 쿠키 없음 → 에러를 그대로 내려주고 남은 쿠키를 정리한다.
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

export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const result = await reissue();

  if (!result.ok) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  setAuthCookies(response, result.data);
  return response;
}

/**
 * 같은 사이트 안의 경로만 허용한다(오픈 리다이렉트 방지).
 * "/"로 시작하고 "//"·"/\"(다른 호스트로 해석될 수 있음)가 아니며, 재발급 라우트 자신도 아니어야 한다.
 */
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next.startsWith("/api/")) return "/";
  return next;
}
