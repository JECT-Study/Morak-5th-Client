/**
 * 인증 상태(백엔드, 위키 4.3).
 * PENDING 판정 대기 / APPROVED 승인 / AUTO_APPROVED 자동 승인 / REJECTED 거절 / FAILED 미제출 실패
 */
export type CertificationStatus =
  "PENDING" | "APPROVED" | "AUTO_APPROVED" | "REJECTED" | "FAILED" | (string & {});

/** POST /challenges/{id}/certifications 응답 data */
export type SubmittedCertification = {
  certificationId: number;
  /** YYYY-MM-DD */
  certDate: string;
  status: CertificationStatus;
  /** ISO 8601 */
  submittedAt: string;
  /** 서명 주소. 서명에 실패하면 null */
  imageUrl: string | null;
};

/** 인증 피드 한 줄. 다른 팀원은 승인된 것만, 내 것은 대기·거절도 온다. */
export type CertificationFeedItem = {
  certificationId: number;
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
  role: string;
  status: CertificationStatus;
  submittedAt: string;
  /** 300초 동안 유효한 서명 주소. 서명에 실패하면 null */
  imageUrl: string | null;
  mine: boolean;
};

/** GET /challenges/{id}/certifications 응답 data */
export type CertificationFeed = {
  certDate: string;
  items: CertificationFeedItem[];
};

/** GET /challenges/{id}/certifications/pending-judgments 한 줄. 내가 판정할 인증(판정 대기, 마감 전) */
export type PendingJudgment = {
  certificationId: number;
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
  /** 제출자의 HOST / DEPUTY / MEMBER */
  role: string;
  /** YYYY-MM-DD */
  certDate: string;
  /** ISO 8601 */
  submittedAt: string;
  /** 판정 마감(인증 다음 날 12:00 KST). 지나면 자동 승인된다 */
  judgeDueAt: string;
  /** 300초 동안 유효한 서명 주소. 서명에 실패하면 null */
  imageUrl: string | null;
};

/** 승인·거절 응답 data */
export type JudgedCertification = {
  certificationId: number;
  status: "APPROVED" | "REJECTED";
};
