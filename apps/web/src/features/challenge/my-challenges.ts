import { useQuery } from "@tanstack/react-query";

import { fetchMyParticipations } from "./challenge-api";
import { CATEGORY_META } from "./components/category-picker";
import type { MyChallengeCardData, MyChallengePhase, MyParticipationItem } from "./types";
import { countDays } from "./utils";

/**
 * 홈에 보일 챌린지 단계. 서버(HOME)는 참여 확정(ACTIVE)만 주고,
 * 그중 시작 보류(START_HELD)는 홈에서 숨긴다(종료·폐기는 서버가 빼서 준다).
 */
const PHASE: Partial<Record<string, MyChallengePhase>> = {
  RECRUITING: "BEFORE_START",
  IN_PROGRESS: "IN_PROGRESS",
  FINALIZING: "FINALIZING",
};

/** 응답 한 행을 카드 데이터로. 홈에 보이지 않을 상태면 null */
export const toMyChallengeCard = (item: MyParticipationItem): MyChallengeCardData | null => {
  const phase = PHASE[item.challengeStatus];
  if (!phase) return null;
  const today = item.todayTeamCertifications;
  return {
    id: item.challengeId,
    phase,
    category: CATEGORY_META[item.category]?.label ?? item.category,
    isPrivate: item.visibility === "PRIVATE",
    title: item.title,
    description: item.description ?? "",
    currentDay: item.progressDay,
    totalDays: countDays(item.startDate, item.endDate),
    startDate: item.startDate,
    endDate: item.endDate,
    memberCount: item.currentCount,
    successRate: item.teamAchievementRate,
    depositAmount: item.pointAmount,
    todayCertifications: today && {
      targetCount: today.targetCount,
      photos: today.photos.map((photo) => ({
        memberId: photo.userId,
        imageUrl: photo.thumbnailUrl,
        certifiedAt: photo.submittedAt,
      })),
    },
    myTodayStatus: item.myTodayStatus,
  };
};

/** 홈 내 챌린지 카드 목록. 방장 판단(useMyRole)과 같은 키를 나눠 쓴다. */
export const useMyChallenges = () =>
  useQuery({
    queryKey: ["users", "me", "participations"],
    queryFn: fetchMyParticipations,
    select: (page) =>
      page.items
        .map(toMyChallengeCard)
        .filter((card): card is MyChallengeCardData => card !== null),
  });
