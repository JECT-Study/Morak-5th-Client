import type { TermsAgreementsRequest } from "@/features/auth/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 최초 약관 동의(POST /users/me/terms-agreements). 온보딩 완료 전에 먼저 해야 한다. */
export async function POST(request: Request) {
  const body = (await request.json()) as TermsAgreementsRequest;
  return toRouteResponse(
    await backendFetch<Record<string, never>>("/users/me/terms-agreements", {
      method: "POST",
      json: body,
    }),
  );
}
