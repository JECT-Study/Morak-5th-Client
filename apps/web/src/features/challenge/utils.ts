const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-01" → "10.01 (수)" */
export const formatShortDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  // 서버(UTC)와 브라우저(KST)에서 요일이 같게 나오도록 UTC 기준으로 계산한다.
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekday})`;
};

/** "10.01 (수) ~ 10.14 (화)" */
export const formatPeriod = (startDate: string, endDate: string) =>
  `${formatShortDate(startDate)} ~ ${formatShortDate(endDate)}`;

/** 남은 일수. 마지막 날이면 0("D-Day") */
export const getRemainingDays = (currentDay: number, totalDays: number) =>
  Math.max(totalDays - currentDay, 0);

/** 9 → "D-9", 0 → "D-Day" */
export const formatDDay = (remainingDays: number) =>
  remainingDays === 0 ? "D-Day" : `D-${remainingDays}`;

/** 5000 → "5,000원" */
export const formatWon = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

/**
 * "2026-10-05T06:02:00+09:00" → "06:02"
 * 서버가 KST 오프셋을 붙여 준다고 보고 문자열에서 그대로 꺼낸다(서버 렌더링 시간대와 무관하게 같게 나온다).
 */
export const formatCertifiedTime = (certifiedAt: string) => certifiedAt.slice(11, 16);
