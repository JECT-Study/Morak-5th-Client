import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { ApiErrorBody, ApiResponse } from "./types";

/**
 * BFF(라우트 핸들러)에서 Spring 백엔드를 호출할 때 쓰는 공통 함수. 서버에서만 쓴다.
 * - HttpOnly 쿠키의 access_token을 꺼내 Authorization 헤더로 붙인다.
 * - 백엔드 공통 응답(ApiResponse)을 해석해 성공·실패를 하나의 모양으로 돌려준다.
 * - 네트워크 오류나 JSON이 아닌 응답도 실패로 바꿔서, 라우트마다 try/catch를 쓰지 않게 한다.
 *
 * TODO: 백엔드 토큰 재발급 API가 나오면 401일 때 재발급 후 한 번 더 시도하는 처리를 여기에 넣는다.
 */

export const ACCESS_TOKEN_COOKIE = "access_token";

export type BackendResult<T> =
  { ok: true; status: number; data: T } | { ok: false; status: number; error: ApiErrorBody };

type BackendFetchOptions = Omit<RequestInit, "body"> & {
  /** JSON으로 보낼 본문. 객체를 넘기면 직렬화하고 Content-Type을 붙인다. */
  json?: unknown;
  /** false면 토큰을 붙이지 않는다(로그인처럼 토큰이 없는 요청). 기본 true */
  auth?: boolean;
};

const failure = (status: number, code: string, message: string): BackendResult<never> => ({
  ok: false,
  status,
  error: { code, message },
});

export async function backendFetch<T>(
  path: string,
  { json, auth = true, headers, ...init }: BackendFetchOptions = {},
): Promise<BackendResult<T>> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (json !== undefined) requestHeaders.set("Content-Type", "application/json");

  if (auth) {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    // 토큰이 없으면 백엔드까지 가지 않고 바로 401로 돌려준다.
    if (!accessToken) return failure(401, "UNAUTHENTICATED", "로그인이 필요합니다.");
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: json === undefined ? undefined : JSON.stringify(json),
      cache: "no-store",
    });
  } catch {
    return failure(502, "BACKEND_UNAVAILABLE", "서버와 연결할 수 없습니다.");
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    return failure(response.status, "INVALID_RESPONSE", "서버 응답을 읽을 수 없습니다.");
  }

  if (response.ok && body.success) return { ok: true, status: response.status, data: body.data };
  return {
    ok: false,
    status: response.ok ? 500 : response.status,
    error: body.success ? { code: "UNKNOWN", message: "알 수 없는 오류입니다." } : body.error,
  };
}

/** backendFetch 결과를 브라우저에 돌려줄 응답으로 바꾼다. 백엔드와 같은 ApiResponse 모양을 유지한다. */
export function toRouteResponse<T>(result: BackendResult<T>) {
  const body: ApiResponse<T> = result.ok
    ? { success: true, data: result.data, error: null }
    : { success: false, data: null, error: result.error };
  return NextResponse.json(body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
