/** 서버 certification.status. 포인트 공개 챌린지에서는 AUTO_APPROVED가 생기지 않지만 응답 타입에는 포함한다. */
export type ReviewStatus = "PENDING" | "APPROVED" | "AUTO_APPROVED" | "REJECTED";

/** 목록 상태 필터. 화면의 "미검수만 보기 / 전체 / 승인 / 거절". */
export type ReviewStatusFilter = "PENDING" | "ALL" | "APPROVED" | "REJECTED";

/** 제출자의 챌린지 내 역할(participation.role). */
export type SubmitterRole = "HOST" | "DEPUTY" | "MEMBER";

/** GET /admin/certification-reviews 쿼리. 비어 있으면 조건에서 뺀다. */
export type ReviewListFilters = {
  /** 인증 날짜(KST) yyyy-MM-dd */
  certDate?: string;
  challengeId?: number;
  status: ReviewStatusFilter;
};

/** 검수 목록 한 줄 (Swagger CertificationReviewView.Item) */
export type ReviewItem = {
  certificationId: number;
  challengeId: number;
  challengeTitle: string;
  /** 탈퇴한 사용자는 null */
  submitterNickname: string | null;
  /** yyyy-MM-dd (KST 날짜) */
  certDate: string;
  /** UTC ISO 8601 */
  submittedAt: string;
  status: ReviewStatus;
};

/** GET /admin/certification-reviews 응답 data. 목록은 서버에서 최대 100건이다. */
export type ReviewPage = {
  items: ReviewItem[];
  /** 현재 조건에 맞는 전체 건수 */
  totalCount: number;
  /** 조건과 무관한 전체 미검수 건수 */
  pendingCount: number;
};

/** GET /admin/certification-reviews/challenges 응답의 한 줄 */
export type ReviewChallengeOption = {
  challengeId: number;
  title: string;
};

/** 처리된 인증의 판정 정보 */
export type ReviewJudge = {
  judgeNickname: string | null;
  /** UTC ISO 8601 */
  judgedAt: string;
  /** 거절일 때만 있다 */
  rejectReason: string | null;
};

/** GET /admin/certification-reviews/{id} 응답 data (Swagger CertificationReviewView.Detail) */
export type ReviewDetail = {
  certificationId: number;
  challengeId: number;
  challengeTitle: string;
  submitterNickname: string | null;
  submitterRole: SubmitterRole;
  certDate: string;
  submittedAt: string;
  status: ReviewStatus;
  /** 챌린지 공통 미션 */
  commonMission: string | null;
  /** 개설 시 정한 인증 방법·규칙 */
  verificationRules: string | null;
  /** 원본 사진 주소. 서버에 사진 저장소 주소가 설정되지 않으면 비어 있다. */
  imageUrls: string[];
  /** 처리 전(PENDING)이면 null */
  judge: ReviewJudge | null;
};
