import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/shared/api/auth-cookies";
import { ACCESS_TOKEN_COOKIE } from "@/shared/api/backend";
import { isProtectedPath } from "@/shared/navigation/protected-paths";

/**
 * 페이지에 들어올 때 로그인 상태를 맞춘다.
 * - 액세스 토큰 있음 → 통과
 * - 액세스 토큰만 만료(로그인 표시 쿠키는 있음) → 재발급 라우트로 보내고, 성공하면 이 페이지로 돌아온다.
 * - 둘 다 없음 → 보호된 페이지는 /login, 나머지는 통과
 * API 요청은 브라우저 request가 401을 받아 재발급하므로 여기서 다루지 않는다(matcher에서 제외).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  if (request.cookies.has(ACCESS_TOKEN_COOKIE)) return NextResponse.next();

  if (request.cookies.has(SESSION_COOKIE)) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(refreshUrl);
  }

  if (isProtectedPath(pathname)) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      // API·Next 내부 파일·정적 파일(확장자 있는 경로)은 제외한다.
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      // 링크 미리 불러오기(prefetch)까지 재발급으로 보내면 동시에 여러 번 재발급하게 된다(rotation 충돌).
      // 실제로 이동할 때의 요청 하나만 처리한다. proxy 안에서는 미리 불러오기 표시 헤더가 지워져
      // 요청을 구분할 수 없어서 여기서 뺀다. 그래서 미리 받아 둔 보호 페이지는 이 검사를 거치지 않고
      // 열릴 수 있고, 그 경우는 화면 쪽 LoginRedirect가 로그인으로 보낸다.
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
