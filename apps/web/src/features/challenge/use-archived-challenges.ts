import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMyParticipations } from "./challenge-api";

/**
 * 지난 챌린지 전체(보관함 ARCHIVE, 최근 순, 커서 페이지). 마이페이지 "종료된 챌린지 전체 보기"(위키 6.8).
 * 채팅 목록이 같은 ARCHIVE 첫 페이지를 다른 모양으로 캐시해서 키를 따로 둔다.
 * 내 챌린지 목록을 다시 받을 때(["users", "me", "participations"]) 함께 새로 받는다.
 */
export const useArchivedChallenges = () =>
  useInfiniteQuery({
    queryKey: ["users", "me", "participations", "ARCHIVE", "all"],
    queryFn: ({ pageParam }) => fetchMyParticipations("ARCHIVE", pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) =>
      last.hasNext && last.nextCursor !== null ? last.nextCursor : undefined,
  });
