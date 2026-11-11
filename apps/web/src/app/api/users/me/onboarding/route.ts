import type { MyUserInfo, OnboardingRequest } from "@/features/auth/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 온보딩 완료(POST /users/me/onboarding). 응답은 갱신된 내 정보. */
export async function POST(request: Request) {
  const body = (await request.json()) as OnboardingRequest;
  return toRouteResponse(
    await backendFetch<MyUserInfo>("/users/me/onboarding", { method: "POST", json: body }),
  );
}
