import type { MyUserInfo } from "@/features/auth/types";
import { clearAuthCookies } from "@/shared/api/auth-cookies";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 내 정보 조회(GET /users/me). 쿠키의 토큰으로 백엔드를 부른다. */
export async function GET() {
  const result = await backendFetch<MyUserInfo>("/users/me");
  return toRouteResponse(result);
}

/**
 * 회원 탈퇴(DELETE /users/me). 백엔드가 모든 로그인 세션을 끊으므로, 성공하면 쿠키도 지운다.
 * 진행 중이거나 시작을 기다리는 챌린지가 있으면 409(USER_005)로 거절된다.
 */
export async function DELETE() {
  const result = await backendFetch<Record<string, never>>("/users/me", { method: "DELETE" });
  const response = toRouteResponse(result);
  if (result.ok) clearAuthCookies(response);
  return response;
}
