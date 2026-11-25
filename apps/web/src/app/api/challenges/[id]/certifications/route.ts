import type { NextRequest } from "next/server";

import type { CertificationFeed, SubmittedCertification } from "@/features/certification/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 한 날짜의 팀 인증 피드(GET /challenges/{id}/certifications?date=YYYY-MM-DD). */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/challenges/[id]/certifications">,
) {
  const { id } = await params;
  const date = request.nextUrl.searchParams.get("date");
  const search = date ? `?${new URLSearchParams({ date })}` : "";
  return toRouteResponse(
    await backendFetch<CertificationFeed>(
      `/challenges/${encodeURIComponent(id)}/certifications${search}`,
    ),
  );
}

/**
 * 오늘 인증 제출(POST /challenges/{id}/certifications?certDate=YYYY-MM-DD).
 * multipart(image 사진 한 장)를 그대로 넘긴다. certDate는 인증하기를 누른 날짜다.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/challenges/[id]/certifications">,
) {
  const { id } = await params;
  const certDate = request.nextUrl.searchParams.get("certDate") ?? "";
  const formData = await request.formData();
  return toRouteResponse(
    await backendFetch<SubmittedCertification>(
      `/challenges/${encodeURIComponent(id)}/certifications?${new URLSearchParams({ certDate })}`,
      { method: "POST", formData },
    ),
  );
}
