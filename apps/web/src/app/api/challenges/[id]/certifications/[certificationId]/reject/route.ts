import type { JudgedCertification } from "@/features/certification/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 인증 거절(POST …/{certificationId}/reject). 몸통 { reason }(필수, 200자 이하)은 제출자에게 보인다. */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/challenges/[id]/certifications/[certificationId]/reject">,
) {
  const { id, certificationId } = await params;
  const body = (await request.json()) as { reason: string };
  return toRouteResponse(
    await backendFetch<JudgedCertification>(
      `/challenges/${encodeURIComponent(id)}/certifications/${encodeURIComponent(certificationId)}/reject`,
      { method: "POST", json: body },
    ),
  );
}
