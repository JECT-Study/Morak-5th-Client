import type { MyUserInfo } from "@/features/auth/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 내 정보 조회(GET /users/me). 쿠키의 토큰으로 백엔드를 부른다. */
export async function GET() {
  const result = await backendFetch<MyUserInfo>("/users/me");
  return toRouteResponse(result);
}
