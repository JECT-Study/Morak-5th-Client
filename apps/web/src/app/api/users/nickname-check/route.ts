import type { NextRequest } from "next/server";

import type { NicknameCheckResponse } from "@/features/auth/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 닉네임 사용 가능 여부(GET /users/nickname-check?nickname=). */
export async function GET(request: NextRequest) {
  const nickname = request.nextUrl.searchParams.get("nickname") ?? "";
  const query = new URLSearchParams({ nickname });
  return toRouteResponse(
    await backendFetch<NicknameCheckResponse>(`/users/nickname-check?${query}`),
  );
}
