import type { ApiResponse } from "./types";
import { REFRESH_URL, refreshOnce } from "./refresh";

/**
 * 브라우저에서 BFF(`/api/*`)를 부를 때 나는 에러.
 * code는 백엔드 에러 코드(예: USER_004 닉네임 중복). 응답이 공통 형식이 아니면 UNKNOWN이다.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  /** 넘기면 JSON 본문으로 보낸다(Content-Type 헤더 포함) */
  json?: unknown;
};

/**
 * 요청을 한 번 보내고 Response를 그대로 돌려준다. 본문은 읽지 않는다(한 번만 읽을 수 있어서).
 * json 본문은 보낼 때마다 직렬화하므로 재발급 뒤 같은 요청을 다시 보내도 된다.
 */
function send(url: string, { json, ...init }: RequestOptions): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: "same-origin",
    ...(json !== undefined && {
      headers: { "Content-Type": "application/json", ...init.headers },
      body: JSON.stringify(json),
    }),
  });
}

/**
 * BFF를 호출하고 공통 응답(ApiResponse)을 풀어 data만 돌려준다. 실패하면 ApiError를 던진다.
 * 401이면 토큰을 재발급하고 딱 한 번 다시 보낸다. 재발급도 실패하면 ApiError(401)이다.
 * 예) request<MyUserInfo>("/api/users/me"), request<T>(url, { method: "POST", json: body })
 */
export async function request<T>(url: string, option: RequestOptions = {}): Promise<T> {
  let response = await send(url, option);

  if (response.status === 401 && url !== REFRESH_URL && (await refreshOnce())) {
    response = await send(url, option);
  }
  // 502 HTML 페이지나 빈 본문처럼 공통 형식이 아닌 응답도 ApiError로 맞춘다.
  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(response.status, "UNKNOWN", "서버 응답을 읽지 못했어요.");
  }

  if (!body.success) throw new ApiError(response.status, body.error.code, body.error.message);
  return body.data;
}
