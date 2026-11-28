import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 구글 AdMob이 광고 시청 직후 직접 호출하는 알림(SSV)을 백엔드 /ads/ssv로 그대로 전달한다.
 * 로그인 없이 열려 있고(proxy는 /api 경로를 건드리지 않는다), 구글 서명이 곧 인증이다.
 *
 * 서명은 디코딩하기 전 원문 쿼리에 대해 계산된다. 쿼리를 파싱·재조립하면(URLSearchParams 등)
 * 인코딩이나 순서가 달라져 검증이 실패하므로 원문 문자열을 한 글자도 바꾸지 않고 붙인다.
 * 백엔드의 상태 코드도 그대로 돌려준다(구글은 200이 아니면 다시 보낸다).
 */
export async function GET(request: NextRequest) {
  let response: Response;
  try {
    response = await fetch(`${process.env.API_BASE_URL}/ads/ssv${request.nextUrl.search}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    return new NextResponse(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  const body = await response.text();
  return new NextResponse(body || null, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "text/plain",
      "Cache-Control": "no-store",
    },
  });
}
