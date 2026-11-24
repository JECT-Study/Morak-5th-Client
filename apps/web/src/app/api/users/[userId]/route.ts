import type { UserProfile } from "@/features/profile/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 사용자 프로필(GET /users/{userId}). 본인도 같은 API로 소개·관심 분야·기록·메달을 받는다. */
export async function GET(_request: Request, { params }: RouteContext<"/api/users/[userId]">) {
  const { userId } = await params;
  return toRouteResponse(await backendFetch<UserProfile>(`/users/${encodeURIComponent(userId)}`));
}
