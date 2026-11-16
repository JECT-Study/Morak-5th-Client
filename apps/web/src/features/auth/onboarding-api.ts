import { request } from "@/shared/api/client";

import type {
  MyUserInfo,
  NicknameCheckResponse,
  OnboardingRequest,
  TermsAgreementsRequest,
} from "./types";

export const agreeToTerms = (body: TermsAgreementsRequest) =>
  request<Record<string, never>>("/api/users/me/terms-agreements", { method: "POST", json: body });

export const completeOnboarding = (body: OnboardingRequest) =>
  request<MyUserInfo>("/api/users/me/onboarding", { method: "POST", json: body });

export const checkNickname = (nickname: string) =>
  request<NicknameCheckResponse>(`/api/users/nickname-check?${new URLSearchParams({ nickname })}`);
