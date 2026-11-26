import type { JudgedCertification } from "@/features/certification/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 인증 승인(POST /challenges/{id}/certifications/{certificationId}/approve). 판정 마감 전에만 된다. */
export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/challenges/[id]/certifications/[certificationId]/approve">,
) {
  const { id, certificationId } = await params;
  return toRouteResponse(
    await backendFetch<JudgedCertification>(
      `/challenges/${encodeURIComponent(id)}/certifications/${encodeURIComponent(certificationId)}/approve`,
      { method: "POST" },
    ),
  );
}
