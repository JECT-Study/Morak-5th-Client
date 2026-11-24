/**
 * 챌린지 결과 응답(백엔드 ChallengeResultView). 정산이 확정한 값이라 FE가 다시 계산하지 않는다(위키 5.12).
 * TODO(D-28): 필드는 백엔드 제안값이다. 정산(반환·차감 포인트)과 이번에 받은 메달은 백엔드 정산 구현 뒤에 붙는다.
 */

/** 팀원 한 명의 결과 */
export type TeamResultMember = {
  participationId: number;
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
  approvedCount: number;
  failedCount: number;
  /** 성공률(%). 소수 첫째 자리까지 */
  achievementRate: number;
  completed: boolean;
  expelled: boolean;
};

/** GET /challenges/{id}/results 응답 data */
export type TeamResult = {
  /** 팀 전체 성공 인증 횟수 */
  teamApprovedCount: number;
  /** 팀 전체 인증 대상 횟수 */
  teamTotalCount: number;
  /** 팀 달성률(%) */
  teamAchievementRate: number;
  /** 인증률이 높은 순 */
  members: TeamResultMember[];
};

/** GET /challenges/{id}/results/me 응답 data */
export type MyResult = {
  participationId: number;
  /** 승인된 인증 횟수 */
  approvedCount: number;
  /** 인증 의무 횟수 */
  totalCount: number;
  /** 내 성공률(%) */
  achievementRate: number;
  /** 팀 달성률(%) */
  teamAchievementRate: number;
  /** 예정 기간까지 퇴장 없이 참여했는지 */
  completed: boolean;
  /** 개인 실패 누적으로 퇴장했는지 */
  expelled: boolean;
  currentStreak: number;
  maxStreak: number;
  /** 결과 확정 시각(ISO 8601) */
  finalizedAt: string;
};
