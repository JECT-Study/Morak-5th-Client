import type { MarketingAgreementRequest } from "@/features/settings/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 마케팅 수신 동의 변경(PATCH /users/me/marketing-agreements). 최초 약관 동의 후에만 된다. */
export async function PATCH(request: Request) {
  const body = (await request.json()) as MarketingAgreementRequest;
  return toRouteResponse(
    await backendFetch<Record<string, never>>("/users/me/marketing-agreements", {
      method: "PATCH",
      json: body,
    }),
  );
}
