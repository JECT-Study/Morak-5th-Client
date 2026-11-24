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

/** 프로필 수정(마이페이지 정보 수정). 몸통은 온보딩과 같다. */
export const updateProfile = (body: OnboardingRequest) =>
  request<MyUserInfo>("/api/users/me", { method: "PATCH", json: body });

export const checkNickname = (nickname: string) =>
  request<NicknameCheckResponse>(`/api/users/nickname-check?${new URLSearchParams({ nickname })}`);
