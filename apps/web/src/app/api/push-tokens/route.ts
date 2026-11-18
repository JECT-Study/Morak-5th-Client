import { backendFetch, toRouteResponse } from "@/shared/api/backend";
import { NextRequest, NextResponse } from "next/server";

/** 본문에서 token을 꺼내 백엔드 /push-tokens로 넘긴다. 저장(PUT)·삭제(DELETE) 모두 { token }을 받는다. */
async function forward(request: NextRequest, method: "PUT" | "DELETE") {
  const body = await request.json().catch(() => null);
  if (!body?.token) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INVALID_BODY", message: "토큰이 없어요." } },
      { status: 400 },
    );
  }
  const { token } = body;

  const response = await backendFetch<Record<string, never>>(`/push-tokens`, {
    method,
    json: { token },
  });
  return toRouteResponse(response);
}

export function PUT(request: NextRequest) {
  return forward(request, "PUT");
}

/** 로그아웃할 때 이 기기 토큰을 지운다. 본인 토큰만 지우며 이미 없어도 성공한다. */
export function DELETE(request: NextRequest) {
  return forward(request, "DELETE");
}
