import type { PointTransaction } from "./types";

/** 3000 → "3,000P" (위키 3.4) */
export const formatPoint = (amount: number) => `${amount.toLocaleString("ko-KR")}P`;

/** 3000 → "+3,000P", -3000 → "-3,000P" */
export const formatPointChange = (amount: number) =>
  `${amount > 0 ? "+" : amount < 0 ? "-" : ""}${formatPoint(Math.abs(amount))}`;

const REASON_LABEL: Record<string, string> = {
  SIGNUP_GIFT: "가입 축하 포인트",
};

/**
 * 거래 유형 라벨(위키 6.7, O11: 유형 라벨 + 금액 + 일시).
 * "보증금"이라는 말은 쓰지 않는다.
 */
export const toTransactionLabel = ({ type, reason }: PointTransaction) => {
  switch (type) {
    case "GRANT":
      return (reason && REASON_LABEL[reason]) ?? "포인트 지급";
    case "DEPOSIT":
      return "챌린지 참여";
    case "REFUND":
      return "참여 포인트 반환";
    default:
      return "포인트 변동";
  }
};

const KST_DATE_TIME = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "2026-11-09T03:00:00Z" → "2026.11.09 12:00" (KST) */
export const formatTransactionTime = (createdAt: string) => {
  const parts = Object.fromEntries(
    KST_DATE_TIME.formatToParts(new Date(createdAt)).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
};
