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
  imageUrl: string;
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
  /** 300초 동안 유효한 서명 주소 */
  imageUrl: string;
  mine: boolean;
};

/** GET /challenges/{id}/certifications 응답 data */
export type CertificationFeed = {
  certDate: string;
  items: CertificationFeedItem[];
};
