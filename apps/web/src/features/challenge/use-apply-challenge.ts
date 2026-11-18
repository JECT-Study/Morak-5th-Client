import { useMutation, useQueryClient } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

export type ApplyBody = { message?: string; inviteCode?: string };

const applyChallenge = (challengeId: string, body: ApplyBody) =>
  request<{ participationId: number }>(
    `/api/challenges/${encodeURIComponent(challengeId)}/applications`,
    { method: "POST", json: body },
  );

/**
 * 챌린지 참가 지원. 지원하면 승인 대기(PENDING)가 되고, 포인트 챌린지는 그 자리에서 포인트를 건다.
 * 성공하면 상세(내 참가 상태)·내 챌린지 목록·포인트 잔액을 다시 불러온다.
 */
export const useApplyChallenge = (challengeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApplyBody) => applyChallenge(challengeId, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["challenges", challengeId], exact: true }),
        queryClient.invalidateQueries({ queryKey: ["users", "me", "participations"] }),
        queryClient.invalidateQueries({ queryKey: ["points", "me"] }),
      ]),
  });
};
