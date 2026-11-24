import type { ReviewListFilters, ReviewStatus, ReviewStatusFilter, SubmitterRole } from "./types";

/** 서버 certification.reject_reason 길이 제한과 같다. */
export const REJECT_REASON_MAX_LENGTH = 200;

export const STATUS_FILTER_OPTIONS: { value: ReviewStatusFilter; label: string }[] = [
  { value: "PENDING", label: "미검수만 보기" },
  { value: "ALL", label: "전체" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "거절" },
];

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "검수 중",
  APPROVED: "승인",
  AUTO_APPROVED: "승인",
  REJECTED: "거절",
};

const ROLE_LABELS: Record<SubmitterRole, string> = {
  HOST: "방장",
  DEPUTY: "부방장",
  MEMBER: "멤버",
};

export const statusLabel = (status: ReviewStatus) => STATUS_LABELS[status];
export const roleLabel = (role: SubmitterRole) => ROLE_LABELS[role];

/** 탈퇴한 사용자는 닉네임이 null로 내려온다. */
export const nicknameLabel = (nickname: string | null) => nickname ?? "탈퇴한 사용자";

/** "2026-11-08" → "2026.11.08" */
export const formatCertDate = (certDate: string) => certDate.replaceAll("-", ".");

const KST_PARTS = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** UTC ISO 시각 → KST "2026.11.08 오후 8:10" */
export const formatDateTime = (iso: string) => {
  const parts = Object.fromEntries(
    KST_PARTS.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}.${parts.month}.${parts.day} ${parts.dayPeriod} ${parts.hour}:${parts.minute}`;
};

const STATUS_FILTERS = new Set<string>(STATUS_FILTER_OPTIONS.map((option) => option.value));

/** 목록 필터는 URL 쿼리(certDate, challengeId, status)에 둔다. 잘못된 값은 기본값으로 돌린다. */
export const parseFilters = (params: URLSearchParams): ReviewListFilters => {
  const certDate = params.get("certDate");
  const challengeId = Number(params.get("challengeId"));
  const status = params.get("status");
  return {
    certDate: certDate && /^\d{4}-\d{2}-\d{2}$/.test(certDate) ? certDate : undefined,
    challengeId: Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined,
    status: status && STATUS_FILTERS.has(status) ? (status as ReviewStatusFilter) : "PENDING",
  };
};
