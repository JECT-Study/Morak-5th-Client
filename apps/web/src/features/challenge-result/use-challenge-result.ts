import { useQuery } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { MyResult, TeamResult } from "./types";

/** 결과는 확정된 뒤 바뀌지 않아서 한 번 받으면 다시 부르지 않는다. */
const FINAL = { staleTime: Infinity, retry: false } as const;

export const useMyResult = (challengeId: string) =>
  useQuery({
    queryKey: ["challenges", challengeId, "results", "me"],
    queryFn: () =>
      request<MyResult>(`/api/challenges/${encodeURIComponent(challengeId)}/results/me`),
    ...FINAL,
  });

/** 팀 결과. 퇴장자 화면은 팀 결과를 보여 주지 않아서 enabled로 끈다. */
export const useTeamResult = (challengeId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["challenges", challengeId, "results"],
    queryFn: () =>
      request<TeamResult>(`/api/challenges/${encodeURIComponent(challengeId)}/results`),
    enabled,
    ...FINAL,
  });
