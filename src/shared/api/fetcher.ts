/**
 * Orval이 생성한 모든 API 호출이 거치는 fetch 래퍼.
 *
 * 브라우저는 토큰을 갖지 않고 같은 출처의 Next BFF(`/api/*`)만 호출한다.
 * BFF가 HttpOnly 쿠키의 토큰을 꺼내 Spring API로 전달한다.
 */
const API_PREFIX = "/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || undefined;
};

export const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_PREFIX}${url}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  const data = await parseBody(response);
  if (!response.ok) throw new ApiError(response.status, data);

  // Orval fetch 클라이언트는 { data, status, headers } 형태를 기대한다.
  return { data, status: response.status, headers: response.headers } as T;
};

export default customFetch;
