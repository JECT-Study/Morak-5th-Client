import { useQuery } from "@tanstack/react-query";

import { fetchMyParticipations } from "@/features/challenge/challenge-api";
import { CATEGORY_META } from "@/features/challenge/components/category-picker";
import type { MyParticipationItem } from "@/features/challenge/types";
import { countDays } from "@/features/challenge/utils";

/** 채팅 목록 한 줄 */
export type ChatListItem = {
  challengeId: number;
  title: string;
  category: string;
  coverImageUrl: string | null;
  /** "2주 (14일) · 6명 · 공개" */
  summary: string;
  /** 완료된 채팅이면 종료일(YYYY-MM-DD) */
  endDate: string;
};

/** 진행중인 채팅: 참여 확정(HOME)이면서 모집 중·진행 중·결과 집계 중. 시작 보류는 홈처럼 숨긴다. */
const ONGOING_STATUSES = ["RECRUITING", "IN_PROGRESS", "FINALIZING"];

/** 완료된 채팅: 채팅 기록을 읽을 수 있는 참가 상태(위키 7절). 폐기된 챌린지는 채팅이 없어 뺀다. */
const ENDED_MY_STATUSES = ["COMPLETED", "EXPELLED", "EARLY_ENDED"];

/** 7일 단위면 "2주 (14일)", 아니면 "10일" */
const formatDuration = (startDate: string, endDate: string) => {
  const days = countDays(startDate, endDate);
  return days % 7 === 0 ? `${days / 7}주 (${days}일)` : `${days}일`;
};

const toChatListItem = (item: MyParticipationItem): ChatListItem => ({
  challengeId: item.challengeId,
  title: item.title,
  category: CATEGORY_META[item.category]?.label ?? item.category,
  coverImageUrl: item.coverImageUrl,
  summary: [
    formatDuration(item.startDate, item.endDate),
    `${item.currentCount}명`,
    item.visibility === "PRIVATE" ? "비공개" : "공개",
  ].join(" · "),
  endDate: item.endDate,
});

/** 진행중인 채팅 목록. 홈 카드(useMyChallenges)와 같은 HOME 응답을 나눠 쓴다. */
export const useOngoingChats = () =>
  useQuery({
    queryKey: ["users", "me", "participations"],
    queryFn: () => fetchMyParticipations(),
    select: (page) =>
      page.items
        .filter((item) => ONGOING_STATUSES.includes(item.challengeStatus))
        .map(toChatListItem),
  });

/**
 * 완료된 채팅 목록(보관함 ARCHIVE 첫 페이지, 최근 순).
 * TODO: 20개가 넘으면 더 보기를 붙인다. 마지막 메시지·안 읽은 수는 백엔드 API가 생기면 붙인다.
 */
export const useEndedChats = () =>
  useQuery({
    queryKey: ["users", "me", "participations", "ARCHIVE"],
    queryFn: () => fetchMyParticipations("ARCHIVE"),
    select: (page) =>
      page.items.filter((item) => ENDED_MY_STATUSES.includes(item.myStatus)).map(toChatListItem),
  });
