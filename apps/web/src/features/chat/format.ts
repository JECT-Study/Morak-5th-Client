const TIME_ZONE = "Asia/Seoul";

/** 메시지 시간. 예) "오전 9:10" */
export const formatChatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });

/** 날짜 구분선. 예) "2026년 11월 17일" */
export const formatChatDate = (createdAt: string) =>
  new Date(createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIME_ZONE,
  });

/** 같은 날(한국 시간)인지 비교할 때 쓰는 "YYYY-MM-DD" */
export const chatDateKey = (createdAt: string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(new Date(createdAt));
