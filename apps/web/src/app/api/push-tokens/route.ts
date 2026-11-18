import { backendFetch, toRouteResponse } from "@/shared/api/backend";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.token) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INVALID_BODY", message: "토큰이 없어요." } },
      { status: 400 },
    );
  }
  const { token } = body;

  const response = await backendFetch<Record<string, never>>(`/push-tokens`, {
    method: "PUT",
    json: { token },
  });
  return toRouteResponse(response);
}
