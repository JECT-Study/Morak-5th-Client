import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { JudgedCertification, PendingJudgment } from "./types";

const pendingKey = (challengeId: string) =>
  ["challenges", challengeId, "certifications", "pending-judgments"] as const;

const base = (challengeId: string) =>
  `/api/challenges/${encodeURIComponent(challengeId)}/certifications`;

/** 내가 판정할 인증 목록(위키 5.10). 사진 주소가 300초짜리라 4분이 지나면 새로 받는다. */
export const usePendingJudgments = (challengeId: string) =>
  useQuery({
    queryKey: pendingKey(challengeId),
    queryFn: () => request<PendingJudgment[]>(`${base(challengeId)}/pending-judgments`),
    staleTime: 4 * 60 * 1000,
  });

type JudgeInput =
  | { certificationId: number; decision: "approve" }
  | { certificationId: number; decision: "reject"; reason: string };

/**
 * 승인·거절. 성공하면 대기 목록에서 바로 빼고(처리한 사진은 사라진다), 그날 인증 피드는 다시 받는다.
 * 이미 판정됐거나 마감이 지났으면(409) 목록을 다시 받아 서버 상태에 맞춘다.
 */
export function useJudgeCertification(challengeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JudgeInput) =>
      request<JudgedCertification>(
        `${base(challengeId)}/${input.certificationId}/${input.decision}`,
        input.decision === "reject"
          ? { method: "POST", json: { reason: input.reason } }
          : { method: "POST" },
      ),
    onSuccess: (_, { certificationId }) => {
      queryClient.setQueryData<PendingJudgment[]>(pendingKey(challengeId), (list) =>
        list?.filter((item) => item.certificationId !== certificationId),
      );
      return queryClient.invalidateQueries({
        queryKey: ["challenges", challengeId, "certifications"],
        predicate: ({ queryKey }) => queryKey[3] !== "pending-judgments",
      });
    },
  });
}
