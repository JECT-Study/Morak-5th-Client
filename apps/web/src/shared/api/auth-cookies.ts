import type { NextResponse } from "next/server";

import type { LoginResponse } from "@/features/auth/types";

import { ACCESS_TOKEN_COOKIE } from "./backend";

/**
 * 로그인·재발급 토큰 쿠키. 서버(라우트 핸들러)에서만 쓴다.
 * 카카오 로그인 콜백과 재발급 라우트가 같은 이름·옵션으로 저장해야, 같은 쿠키를 덮어쓴다.
 * (path가 다르면 이름이 같은 쿠키가 둘 생겨 옛 리프레시 토큰이 계속 실릴 수 있다)
 */
export const REFRESH_TOKEN_COOKIE = "refresh_token";

/** refresh_token 쿠키 수명(초). 백엔드 morak.auth.jwt.refresh-token-validity(P30D)와 맞춘다. */
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

/** 모든 요청에 실린다. backendFetch가 읽어 Authorization 헤더로 붙인다. */
const ACCESS_TOKEN_PATH = "/";
/** 리프레시 토큰은 재발급·로그아웃(/api/auth/*)에만 실리도록 좁혀 둔다. */
const REFRESH_TOKEN_PATH = "/api/auth";

type AuthTokens = Pick<LoginResponse, "accessToken" | "refreshToken" | "accessTokenExpiresIn">;

/** 로그인·재발급으로 받은 토큰을 httpOnly 쿠키로 저장한다. */
export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  // 로컬(http://localhost)에서는 secure 쿠키가 저장·전송되지 않아 배포에서만 켠다.
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: ACCESS_TOKEN_PATH,
    maxAge: tokens.accessTokenExpiresIn,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: REFRESH_TOKEN_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/** 토큰 쿠키를 지운다. 저장할 때와 path가 같아야 지워진다. */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete({ name: ACCESS_TOKEN_COOKIE, path: ACCESS_TOKEN_PATH });
  response.cookies.delete({ name: REFRESH_TOKEN_COOKIE, path: REFRESH_TOKEN_PATH });
}
