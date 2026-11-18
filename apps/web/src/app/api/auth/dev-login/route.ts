import { NextResponse, type NextRequest } from "next/server";

import { afterLoginPath } from "@/features/auth/after-login-path";
import type { LoginResponse, SocialLoginRequest } from "@/features/auth/types";
import { setAuthCookies } from "@/shared/api/auth-cookies";
import { backendFetch } from "@/shared/api/backend";

/** 백엔드 dev 로그인이 받는 code 형식(영문·숫자·_·-, 64자 이하) */
const CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * 개발용 테스트 로그인(백엔드 POST /auth/login/dev). 카카오 없이 계정을 만들고 로그인한다.
 * - ?code=tester1: 같은 code면 같은 계정으로 다시 로그인한다.
 * - code 없음: 매번 새 계정(온보딩 전)을 만든다. 온보딩을 처음부터 다시 볼 때 쓴다.
 * 백엔드가 local 프로필일 때만 동작하고, 프로덕션 빌드에서는 이 라우트를 막는다.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const code = request.nextUrl.searchParams.get("code")?.trim() || `test-${Date.now()}`;
  if (!CODE_PATTERN.test(code)) {
    return NextResponse.redirect(new URL("/login?error=dev_login_failed", request.url));
  }

  const result = await backendFetch<LoginResponse>("/auth/login/dev", {
    method: "POST",
    auth: false,
    json: { code } satisfies SocialLoginRequest,
  });
  if (!result.ok) {
    return NextResponse.redirect(new URL("/login?error=dev_login_failed", request.url));
  }

  const response = NextResponse.redirect(new URL(await afterLoginPath(result.data), request.url));
  setAuthCookies(response, result.data);
  return response;
}
