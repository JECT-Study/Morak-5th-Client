/** 오늘 인증을 마친 팀원 한 명 */
export type TodayCertification = {
  memberId: number;
  /** 서명 주소(5분 유효). 서명에 실패하면 null */
  imageUrl: string | null;
  /** ISO 8601, 서버 기준 시각(KST) 예) "2026-10-05T06:02:00+09:00" */
  certifiedAt: string;
};

/** 홈 카드의 단계. 시작 전(모집 중) / 진행 중 / 결과 집계 중 */
export type MyChallengePhase = "BEFORE_START" | "IN_PROGRESS" | "FINALIZING";

/** 홈(내 챌린지) 카드에 필요한 데이터. GET /users/me/participations 응답에서 바꿔 넘긴다(toMyChallengeCard). */
export type MyChallengeCardData = {
  id: number;
  phase: MyChallengePhase;
  category: string;
  isPrivate: boolean;
  title: string;
  description: string;
  /** 1부터 시작하는 현재 일차. 시작 전이면 null */
  currentDay: number | null;
  totalDays: number;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  memberCount: number;
  /** 팀 달성률(0~100). 인증 집계가 없으면 null */
  successRate: number | null;
  /** 1인 참여 포인트. 0이면 포인트 없음 */
  depositAmount: number;
  /** 오늘 인증 현황. 인증 집계가 없으면 null */
  todayCertifications: { targetCount: number; photos: TodayCertification[] } | null;
  /** 오늘 내 인증 상태. 제출 전이면 null */
  myTodayStatus: string | null;
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

/** 참가 역할(백엔드 ParticipationRole). HOST 방장 / DEPUTY 부방장 / MEMBER 참여자 */
export type ParticipationRole = "HOST" | "DEPUTY" | "MEMBER" | (string & {});

/**
 * GET /users/me/participations 응답의 한 행(백엔드 MyChallengeItem).
 * TODO(D-23): 필드명은 백엔드 제안값이다. 인증 관련 값(teamAchievementRate~pendingJudgeCount)은 인증 집계 연동 전까지 null.
 */
export type MyParticipationItem = {
  participationId: number;
  challengeId: number;
  title: string;
  description: string | null;
  category: ChallengeCategory;
  /** "PUBLIC" | "PRIVATE" */
  visibility: string;
  coverImageUrl: string | null;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  pointAmount: number;
  myRole: ParticipationRole;
  /** 내 참가 상태(위키 4.4) */
  myStatus: string;
  challengeStatus: ChallengeStatus;
  currentCount: number;
  capacity: number;
  /** 진행 일차(1부터). 진행 중·결과 집계 중일 때만 */
  progressDay: number | null;
  startHeld: { currentCount: number; minCount: number; recruitDeadline: string } | null;
  teamAchievementRate: number | null;
  todayTeamCertifications: {
    certifiedCount: number;
    targetCount: number;
    photos: { userId: number; thumbnailUrl: string; submittedAt: string }[];
  } | null;
  myTodayStatus: string | null;
  pendingJudgeCount: number | null;
};

/** GET /users/me/participations 응답 data (백엔드 MyChallengePage) */
export type MyParticipationPage = {
  items: MyParticipationItem[];
  nextCursor: number | null;
  hasNext: boolean;
};

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

/** POST /challenges/{id}/reschedule 응답 data. 재설정되면 모집 중(RECRUITING)으로 돌아간다. */
export type RescheduledChallenge = {
  challengeId: number;
  status: ChallengeStatus;
  /** "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
};

/** POST /challenges/{id}/discard 응답 data */
export type DiscardedChallenge = { challengeId: number; status: ChallengeStatus };
