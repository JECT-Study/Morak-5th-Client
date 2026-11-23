import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import { fetchMyParticipations } from "./challenge-api";
import type { DiscardedChallenge, RescheduledChallenge } from "./types";

/**
 * 시작 보류 안내에 쓸 내 참여 정보(역할, 현재·최소 인원, 선택 기한).
 * 챌린지 상세 응답에 없어서 내 챌린지 목록(HOME)에서 찾는다. useMyRole과 같은 키라 요청은 한 번만 간다.
 * 참여하지 않았으면 null.
 */
export const useStartHeldInfo = (challengeId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["users", "me", "participations"],
    queryFn: () => fetchMyParticipations(),
    enabled,
    select: (page) => page.items.find((item) => String(item.challengeId) === challengeId) ?? null,
  });

/**
 * 성공·실패 모두 상세와 내 챌린지 목록을 다시 불러온다.
 * 409(이미 처리됨)는 화면이 오래된 경우라, 다시 불러오면 바뀐 상태가 보인다.
 * 폐기는 참가자 포인트를 바로 돌려주므로 내 포인트도 다시 불러온다.
 */
const useStartHeldMutation = <T, V>(
  challengeId: string,
  mutationFn: (variables: V) => Promise<T>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["challenges", challengeId], exact: true }),
        queryClient.invalidateQueries({ queryKey: ["users", "me", "participations"] }),
        queryClient.invalidateQueries({ queryKey: ["points", "me"] }),
      ]),
  });
};

/** 시작 보류 챌린지의 기간을 다시 정한다(위키 5.7). 성공하면 모집 중으로 돌아간다. */
export const useRescheduleChallenge = (challengeId: string) =>
  useStartHeldMutation(challengeId, (period: { startDate: string; endDate: string }) =>
    request<RescheduledChallenge>(`/api/challenges/${encodeURIComponent(challengeId)}/reschedule`, {
      method: "POST",
      json: period,
    }),
  );

/** 시작 보류 챌린지를 폐기한다(위키 5.7). 되돌릴 수 없다. */
export const useDiscardChallenge = (challengeId: string) =>
  useStartHeldMutation(challengeId, () =>
    request<DiscardedChallenge>(`/api/challenges/${encodeURIComponent(challengeId)}/discard`, {
      method: "POST",
    }),
  );
