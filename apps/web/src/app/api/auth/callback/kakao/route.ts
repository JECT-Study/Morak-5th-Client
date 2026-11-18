import { NextRequest, NextResponse } from "next/server";

import { afterLoginPath } from "@/features/auth/after-login-path";
import type { LoginResponse, SocialLoginRequest } from "@/features/auth/types";
import { setAuthCookies } from "@/shared/api/auth-cookies";
import { backendFetch } from "@/shared/api/backend";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const saveState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== saveState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  // 로그인 전이라 토큰이 없으므로 auth: false
  const result = await backendFetch<LoginResponse>("/auth/login/kakao", {
    method: "POST",
    auth: false,
    json: { code } satisfies SocialLoginRequest,
  });
  if (!result.ok) {
    return NextResponse.redirect(new URL("/login?error=login_failed", request.url));
  }
  const response = NextResponse.redirect(new URL(await afterLoginPath(result.data), request.url));
  setAuthCookies(response, result.data);
  response.cookies.delete("oauth_state");
  return response;
}
