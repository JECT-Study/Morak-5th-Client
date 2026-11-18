import { type ChallengeCreateForm } from "@/features/challenge/create-schema";
import type { ChallengeView, MyParticipationPage } from "@/features/challenge/types";
import { request } from "@/shared/api/client";

/** 챌린지 개설 결과. 백엔드 CreatedChallenge */
export type CreatedChallenge = { challengeId: number; inviteCode: string };

/**
 * 챌린지 개설. 대표 사진이 있으면 multipart(challenge JSON + coverImage), 없으면 JSON으로 보낸다.
 */
export const createChallenge = (
  body: ReturnType<typeof toCreateChallengeRequest>,
  coverImage?: File | null,
) => {
  if (!coverImage)
    return request<CreatedChallenge>("/api/challenges", { method: "POST", json: body });
  const formData = new FormData();
  // 백엔드 @RequestPart("challenge")가 JSON으로 읽도록 Content-Type을 붙인다.
  formData.append("challenge", new Blob([JSON.stringify(body)], { type: "application/json" }));
  formData.append("coverImage", coverImage);
  return request<CreatedChallenge>("/api/challenges", { method: "POST", formData });
};

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

export const fetchChallenge = (id: string) =>
  request<ChallengeView>(`/api/challenges/${encodeURIComponent(id)}`);

/**
 * 내 챌린지 목록. HOME(기본)은 참여 중인 챌린지 전체를 한 번에,
 * ARCHIVE(보관함)는 퇴장·완주·조기 종료·폐기된 챌린지를 최근 순으로 준다(기본 20개).
 */
export const fetchMyParticipations = (status: "HOME" | "ARCHIVE" = "HOME") =>
  request<MyParticipationPage>(
    status === "HOME"
      ? "/api/users/me/participations"
      : `/api/users/me/participations?status=${status}`,
  );
