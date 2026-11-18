const TIME_ZONE = "Asia/Seoul";

const dateKey = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(date);

const time = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

const monthDay = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: TIME_ZONE, month: "long", day: "numeric" }).format(
    date,
  );

/** 신청 시각. 오늘이면 "오늘 06:02", 아니면 "10월 21일 06:02"(한국 시간) */
export const formatAppliedAt = (appliedAt: string, now = new Date()) => {
  const date = new Date(appliedAt);
  const day = dateKey(date) === dateKey(now) ? "오늘" : monthDay(date);
  return `${day} ${time(date)}`;
};
