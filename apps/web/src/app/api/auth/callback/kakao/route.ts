import { NextRequest, NextResponse } from "next/server";

import type { LoginResponse, SocialLoginRequest } from "@/features/auth/types";
import { ACCESS_TOKEN_COOKIE, backendFetch } from "@/shared/api/backend";

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
  const { accessToken, refreshToken, accessTokenExpiresIn, onboarded } = result.data;

  const response = NextResponse.redirect(new URL(onboarded ? "/" : "/onboarding", request.url));

  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: accessTokenExpiresIn,
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 14, // 만료 기간은 BE 확인 필요
  });
  response.cookies.delete("oauth_state");
  return response;
}
