/** 알림 종류(백엔드 NotificationType, 위키 11절 #1~#12). 새 값이 더해질 수 있어 string도 받는다. */
export type NotificationType =
  | "PARTICIPATION_APPROVED"
  | "PARTICIPATION_REJECTED"
  | "APPLICATION_INVALIDATED"
  | "START_HELD"
  | "SCHEDULE_RESET"
  | "CHALLENGE_DISCARDED"
  | "CHALLENGE_AUTO_DISCARDED"
  | "DEPUTY_ASSIGNED"
  | "JUDGE_OVERDUE_WARNING"
  | "EXPELLED"
  | "EARLY_ENDED"
  | "CERTIFICATION_REJECTED"
  | (string & {});

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  /** 눌렀을 때 이동할 대상 종류. 지금은 "CHALLENGE"뿐. 이동할 곳이 없으면 null */
  targetType: string | null;
  targetId: number | null;
  read: boolean;
  /** UTC ISO 8601. 화면에는 KST로 바꿔 보여 준다 */
  createdAt: string;
};

/** GET /notifications 응답 data */
export type NotificationPage = {
  notifications: AppNotification[];
  /** 다음 페이지를 부를 때 before로 넘길 값. 마지막 페이지면 null */
  nextCursor: number | null;
};
