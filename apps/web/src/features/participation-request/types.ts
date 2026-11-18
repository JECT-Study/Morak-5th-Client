/**
 * 방장이 보는 참여 신청(백엔드 ApplicationView).
 * TODO(D-25): 쿼리 값과 응답 필드명은 백엔드 제안값이다. 확정되면 맞춘다.
 */
export type ParticipationRequestStatus = "PENDING" | "INVALIDATED" | "ACTIVE" | "REJECTED";

/** 목록 조회 쿼리. PENDING에는 무효(INVALIDATED) 신청도 같이 온다. */
export type ParticipationRequestFilter = "PENDING" | "ACTIVE" | "REJECTED";

export type Applicant = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  /** 개인 인증률(정수 %). 인증 기록이 없으면 null */
  certificationRate: number | null;
  /** 모락이 단계(1~5). 인증 기록이 없으면 null */
  morakiStage: number | null;
  completedCount: number;
  midwayFailCount: number;
  medals: { code: string; name: string; iconUrl: string | null }[];
};

export type ParticipationRequest = {
  participationId: number;
  status: ParticipationRequestStatus | (string & {});
  /** 각오 한마디. 없으면 null */
  message: string | null;
  /** ISO 8601 */
  appliedAt: string;
  applicant: Applicant;
};

/** GET /challenges/{id}/participation-requests 응답 data */
export type ParticipationRequestList = { items: ParticipationRequest[] };

export type RequestAction = "approve" | "reject" | "confirm-invalid";
