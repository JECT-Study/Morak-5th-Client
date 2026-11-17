/** 오늘 인증을 마친 팀원 한 명 */
export type TodayCertification = {
  memberId: number;
  imageUrl: string;
  /** ISO 8601, 서버 기준 시각(KST) 예) "2026-10-05T06:02:00+09:00" */
  certifiedAt: string;
};

/**
 * 홈(내 챌린지) 카드에 필요한 데이터.
 * API가 나오면 GET /users/me/participations 응답에서 이 모양으로 바꿔 넘긴다.
 */
export type MyChallengeCardData = {
  id: number;
  category: string;
  isPrivate: boolean;
  title: string;
  description: string;
  /** 1부터 시작하는 현재 일차 */
  currentDay: number;
  totalDays: number;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  memberCount: number;
  /** 팀 누적 성공률(0~100) */
  successRate: number;
  /** 1인 보증금(원). 0이면 보증금 없음 */
  depositAmount: number;
  todayCertifications: TodayCertification[];
};

/** 챌린지 카테고리 (백엔드 Category enum) */
export type ChallengeCategory = "STUDY" | "EXERCISE" | "CAREER" | "LIFESTYLE" | "READING";

/**
 * 챌린지 진행 상태(백엔드 status). 화면 표시는 위키 4.1.
 * 백엔드가 새 값을 더할 수 있어 string도 받는다.
 */
export type ChallengeStatus =
  | "RECRUITING"
  | "START_HELD"
  | "IN_PROGRESS"
  | "FINALIZING"
  | "ENDED"
  | "DISCARDED"
  | (string & {});

/** GET /challenges/{id} 응답 data (Swagger ChallengeView) */
export type ChallengeView = {
  id: number;
  title: string;
  description: string;
  /** "PUBLIC" | "PRIVATE" */
  visibility: string;
  category: ChallengeCategory;
  purpose: string | null;
  commonMission: string;
  verificationRules: string;
  expectations: string | null;
  status: ChallengeStatus;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  capacity: number;
  currentCount: number;
  /** 1인 참여 포인트. 0이면 포인트 없는 챌린지 */
  pointAmount: number;
  /** 내 참가 상태(위키 4.4). 참가하지 않았으면 null */
  myParticipationStatus: string | null;
  canApply: boolean;
  coverImageUrl: string | null;
};
