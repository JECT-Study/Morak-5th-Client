import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

// 인코딩·순서가 섞인 원문. 구글 서명은 이 문자열 그대로에 대해 계산된다.
const RAW_QUERY =
  "?ad_network=1&custom_data=a%2Bb%3D&reward_amount=1&timestamp=1&transaction_id=ABC&user_id=12&signature=MEUCIQ%2Fab-_&key_id=3335741209";

describe("GET /api/ads/ssv", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", "https://api.example.com");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("쿼리를 바꾸지 않고 그대로 백엔드 /ads/ssv에 붙여 캐시 없이 전달한다", async () => {
    fetchMock.mockResolvedValue(new Response("ok", { status: 200 }));

    const response = await GET(new NextRequest(`http://localhost/api/ads/ssv${RAW_QUERY}`));

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.example.com/ads/ssv${RAW_QUERY}`,
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("백엔드의 상태 코드를 그대로 돌려준다", async () => {
    fetchMock.mockResolvedValue(new Response("bad", { status: 400 }));
    const response = await GET(new NextRequest(`http://localhost/api/ads/ssv${RAW_QUERY}`));
    expect(response.status).toBe(400);
  });

  it("본문이 없는 응답(204)도 그대로 돌려준다", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const response = await GET(new NextRequest(`http://localhost/api/ads/ssv${RAW_QUERY}`));
    expect(response.status).toBe(204);
  });

  it("백엔드에 닿지 못하면 502", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const response = await GET(new NextRequest(`http://localhost/api/ads/ssv${RAW_QUERY}`));
    expect(response.status).toBe(502);
  });
});
