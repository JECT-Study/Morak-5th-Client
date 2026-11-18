import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  decideParticipationRequest,
  fetchParticipationRequests,
} from "./participation-request-api";
import type { ParticipationRequestFilter, RequestAction } from "./types";

export const participationRequestsKey = (challengeId: string) =>
  ["challenges", challengeId, "participation-requests"] as const;

/** 방장의 참여 신청 목록. 방장이 아니면 403이라 enabled로 막는다. */
export const useParticipationRequests = (
  challengeId: string,
  status: ParticipationRequestFilter,
  enabled = true,
) =>
  useQuery({
    queryKey: [...participationRequestsKey(challengeId), status],
    queryFn: () => fetchParticipationRequests(challengeId, status),
    enabled,
  });

/**
 * 승인·거절·무효 확인. 승인으로 정원이 차면 서버가 나머지를 일괄 거절하므로
 * 화면에서 미리 바꾸지 않고 목록과 상세(확정 인원)를 다시 불러온다(위키 5.5).
 */
export const useDecideParticipationRequest = (challengeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ participationId, action }: { participationId: number; action: RequestAction }) =>
      decideParticipationRequest(challengeId, participationId, action),
    // 성공·실패 모두 다시 불러온다. 409(정원 마감, 대기 신청 변경)는 목록이 바뀐 경우다.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: participationRequestsKey(challengeId) }),
        queryClient.invalidateQueries({ queryKey: ["challenges", challengeId], exact: true }),
      ]),
  });
};
