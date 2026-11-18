import { useQuery } from "@tanstack/react-query";

import { fetchMyParticipations } from "./challenge-api";
import type { ParticipationRole } from "./types";

/**
 * 이 챌린지에서 내 역할. 참여하지 않았으면 null.
 * 챌린지 상세 응답에 역할이 없어서 내 챌린지 목록(HOME)에서 찾는다.
 * TODO: 상세 응답에 myRole이 생기면 그 값으로 바꾸고 이 훅을 지운다.
 *
 * @param enabled 참여 기록이 있을 때만 부른다(둘러보기·미참여자는 요청하지 않는다).
 */
export const useMyRole = (challengeId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["users", "me", "participations"],
    queryFn: () => fetchMyParticipations(),
    enabled,
    select: (page): ParticipationRole | null =>
      page.items.find((item) => String(item.challengeId) === challengeId)?.myRole ?? null,
  });
