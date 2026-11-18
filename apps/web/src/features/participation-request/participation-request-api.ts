import { request } from "@/shared/api/client";

import type { ParticipationRequestFilter, ParticipationRequestList, RequestAction } from "./types";

const base = (challengeId: string) => `/api/challenges/${encodeURIComponent(challengeId)}`;

export const fetchParticipationRequests = (
  challengeId: string,
  status: ParticipationRequestFilter,
) =>
  request<ParticipationRequestList>(
    `${base(challengeId)}/participation-requests?${new URLSearchParams({ status })}`,
  );

export const decideParticipationRequest = (
  challengeId: string,
  participationId: number,
  action: RequestAction,
) =>
  request<Record<string, never>>(`${base(challengeId)}/applications/${participationId}/${action}`, {
    method: "POST",
  });
