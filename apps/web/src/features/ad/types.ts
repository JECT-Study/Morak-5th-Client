/** POST /ads/reward-sessions 응답 data (Swagger AdRewardSessionResponse) */
export type AdRewardSession = {
  /** 시청 토큰(1회용). 앱이 구글 SSV 옵션(customData)에 실어, 구글이 서버로 보낸다 */
  token: string;
  /** 이 시간(초) 이상 시청해야 보상을 받을 수 있다 */
  minWatchSeconds: number;
  /** 토큰 만료 시각(UTC ISO 8601) */
  expiresAt: string;
  /** 오늘 더 받을 수 있는 횟수 */
  remainingToday: number;
};
