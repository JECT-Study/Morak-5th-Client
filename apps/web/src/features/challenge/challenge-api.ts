import { type ChallengeCreateForm } from "@/features/challenge/create-schema";
import { request } from "@/shared/api/client";

/** 챌린지 개설 결과. 백엔드 CreatedChallenge */
export type CreatedChallenge = { challengeId: number; inviteCode: string };

export const createChallenge = (body: ReturnType<typeof toCreateChallengeRequest>) =>
  request<CreatedChallenge>("/api/challenges", { method: "POST", json: body });

export const toCreateChallengeRequest = (values: ChallengeCreateForm) => ({
  title: values.title,
  category: values.category,
  visibility: values.visibility,
  description: values.description,
  purpose: values.purpose || undefined,
  commonMission: values.commonMission,
  verificationRules: values.verificationRules,
  startDate: values.startDate,
  endDate: values.endDate,
  capacity: values.capacity,
  pointAmount: values.usePoint ? values.pointAmount : undefined,
  expectations: values.message || undefined,
});
