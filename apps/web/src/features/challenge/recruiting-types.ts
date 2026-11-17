import type { CHALLENGE_CATEGORIES } from "./create-schema";

/** GET /challenges 목록 한 줄 (Swagger ChallengeListItem) */
export type ChallengeListItem = {
  id: number;
  title: string;
  description: string | null;
  category: (typeof CHALLENGE_CATEGORIES)[number];
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  capacity: number;
  currentCount: number;
  /** 1인 참여 포인트. 0이면 포인트 없는 챌린지 */
  pointAmount: number;
  coverImageUrl: string | null;
};

/** GET /challenges 응답 data (Swagger ChallengePage). 다음 페이지는 nextCursor를 cursor로 넘긴다. */
export type ChallengePage = {
  items: ChallengeListItem[];
  nextCursor: number | null;
  hasNext: boolean;
};

/** 목록 검색 조건. category가 없으면 전체 */
export type RecruitingFilter = {
  category?: ChallengeListItem["category"];
  keyword?: string;
};
