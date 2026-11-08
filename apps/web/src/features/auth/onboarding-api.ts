import type { ApiResponse } from "@/shared/api/types";

import type {
  MyUserInfo,
  NicknameCheckResponse,
  OnboardingRequest,
  TermsAgreementsRequest,
} from "./types";

/** BFF 요청 실패. code는 백엔드 에러 코드(예: USER_004 닉네임 중복) */
export class AuthApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, credentials: "same-origin" });
  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success) throw new AuthApiError(response.status, body.error.code, body.error.message);
  return body.data;
}

const postJson = <T>(input: string, json: unknown) =>
  request<T>(input, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });

export const agreeToTerms = (body: TermsAgreementsRequest) =>
  postJson<Record<string, never>>("/api/users/me/terms-agreements", body);

export const completeOnboarding = (body: OnboardingRequest) =>
  postJson<MyUserInfo>("/api/users/me/onboarding", body);

export const checkNickname = (nickname: string) =>
  request<NicknameCheckResponse>(`/api/users/nickname-check?${new URLSearchParams({ nickname })}`);
