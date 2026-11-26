import type { AppNotification } from "./types";

/**
 * 알림을 눌렀을 때 갈 경로(위키 8절). 이동할 곳이 없으면 null.
 * - 신청 무효(#3)·참여 신청 접수(#13), 방장: 참여 신청 관리에서 확인한다.
 * - 그 밖의 챌린지 알림: 챌린지 상세.
 * TODO: 시작 보류 대응·판정·퇴장 공지 상세 화면이 생기면 종류별로 나눈다.
 */
export const toNotificationPath = ({ type, targetType, targetId }: AppNotification) => {
  if (targetType !== "CHALLENGE" || targetId === null) return null;
  if (type === "APPLICATION_INVALIDATED" || type === "PARTICIPATION_REQUESTED") {
    return `/challenges/${targetId}/manage/requests`;
  }
  return `/challenges/${targetId}`;
};

const TIME_ZONE = "Asia/Seoul";
const dateKey = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(date);

/** 알림 시각. 오늘이면 "오후 3:05", 아니면 "11월 17일"(한국 시간) */
export const formatNotificationTime = (createdAt: string, now = new Date()) => {
  const date = new Date(createdAt);
  if (dateKey(date) === dateKey(now)) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TIME_ZONE,
    });
  }
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", timeZone: TIME_ZONE });
};
