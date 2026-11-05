import { NextRequest, NextResponse } from "next/server";

import type { LoginResponse, SocialLoginRequest } from "@/features/auth/types";
import type { ApiResponse } from "@/shared/api/types";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const saveState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== saveState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  let res: Response;
  let body: ApiResponse<LoginResponse>;

  try {
    res = await fetch(`${process.env.API_BASE_URL}/auth/login/kakao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code } satisfies SocialLoginRequest),
    });
    body = (await res.json()) as ApiResponse<LoginResponse>;
  } catch {
    return NextResponse.redirect(new URL("/login?error=login_failed", request.url));
  }
  if (!res.ok || !body.success) {
    return NextResponse.redirect(new URL("/login?error=login_failed", request.url));
  }
  const { accessToken, refreshToken, accessTokenExpiresIn, onboarded } = body.data;

  const response = NextResponse.redirect(new URL(onboarded ? "/" : "/onboarding", request.url));

  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("access_token", accessToken, {
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
