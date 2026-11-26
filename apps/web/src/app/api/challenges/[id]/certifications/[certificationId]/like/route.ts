import type { CertificationLike } from "@/features/certification/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

type Context = RouteContext<"/api/challenges/[id]/certifications/[certificationId]/like">;

const likePath = async ({ params }: Context) => {
  const { id, certificationId } = await params;
  return `/challenges/${encodeURIComponent(id)}/certifications/${encodeURIComponent(certificationId)}/like`;
};

/** 인증 좋아요(PUT …/like). 승인된 인증에만 누를 수 있고, 이미 눌렀으면 그대로 둔다. 응답은 처리 뒤 상태. */
export async function PUT(_request: Request, context: Context) {
  return toRouteResponse(
    await backendFetch<CertificationLike>(await likePath(context), { method: "PUT" }),
  );
}

/** 좋아요 취소(DELETE …/like). 누르지 않았으면 그대로 둔다. */
export async function DELETE(_request: Request, context: Context) {
  return toRouteResponse(
    await backendFetch<CertificationLike>(await likePath(context), { method: "DELETE" }),
  );
}
