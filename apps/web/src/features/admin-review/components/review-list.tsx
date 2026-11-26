"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";

import { isAccessError, useReviewChallenges, useReviewList } from "../api";
import type { ReviewStatusFilter } from "../types";
import {
  formatCertDate,
  formatDateTime,
  isOverdue,
  nicknameLabel,
  parseFilters,
  STATUS_FILTER_OPTIONS,
  statusLabel,
} from "../utils";
import AccessDenied from "./access-denied";
import AdminCard from "./admin-card";
import ChallengeSummary from "./challenge-summary";
import OverdueBadge from "./overdue-badge";

const controlClass =
  "border-line bg-surface-primary text-body-md font-body-normal text-fg-primary rounded-6 h-10 border px-3";
const cellClass = "border-line-subtle border px-2 py-3 text-left align-middle";

/** 검수 목록(Figma "검수 목록 → 검수할 인증 선택"). 필터는 URL 쿼리에 두어 상세에서 돌아와도 유지된다. */
export default function ReviewList() {
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const list = useReviewList(filters);

  if (isAccessError(list.error)) {
    return (
      <AccessDenied unauthenticated={list.error instanceof ApiError && list.error.status === 401} />
    );
  }

  const query = searchParams.toString();
  const detailQuery = query ? `?${query}` : "";

  return (
    <AdminCard
      header={
        <>
          <h1 className="text-title-2 font-title text-fg-primary">인증 검수</h1>
          <span className="text-label-sm font-label-normal text-fg-tertiary ml-auto">
            운영진 전용
          </span>
        </>
      }
    >
      <p className="text-body-md font-body-normal text-fg-primary">
        포인트 공개 챌린지에 제출된 인증을 확인해 주세요.
      </p>

      <SummaryPanel />

      {/* URL이 바뀌면 폼 입력값도 그 값으로 다시 시작한다. */}
      <FilterForm key={query} initial={filters} />

      {list.isPending ? (
        <p className="text-body-md text-fg-tertiary py-6 text-center">불러오는 중이에요.</p>
      ) : list.isError ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-body-md text-danger">목록을 불러오지 못했어요.</p>
          <Button size="sm" variant="outline" onClick={() => list.refetch()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          <table className="text-body-md font-body-normal text-fg-primary w-full border-collapse">
            <thead>
              <tr className="bg-surface-secondary">
                {[
                  "챌린지",
                  "제출자",
                  "인증 날짜",
                  "제출 시각",
                  "검수 마감",
                  "검수 상태",
                  "확인",
                ].map((title) => (
                  <th key={title} scope="col" className={`${cellClass} font-body-strong`}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${cellClass} text-fg-tertiary text-center`}>
                    조건에 맞는 인증이 없어요.
                  </td>
                </tr>
              ) : (
                list.data.items.map((item) => (
                  <tr key={item.certificationId}>
                    <td className={cellClass}>{item.challengeTitle}</td>
                    <td className={cellClass}>{nicknameLabel(item.submitterNickname)}</td>
                    <td className={cellClass}>{formatCertDate(item.certDate)}</td>
                    <td className={cellClass}>{formatDateTime(item.submittedAt)}</td>
                    <td className={cellClass}>{formatDateTime(item.reviewDueAt)}</td>
                    <td className={cellClass}>
                      {statusLabel(item.status)}
                      {isOverdue(item.status, item.reviewDueAt) && <OverdueBadge />}
                    </td>
                    <td className={cellClass}>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/${item.certificationId}${detailQuery}`}>
                          {item.status === "PENDING" ? "검수하기" : "결과 보기"}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p className="text-body-md font-body-normal text-fg-secondary">
            조회 {list.data.totalCount}건 / 전체 미검수 {list.data.pendingCount}건
            {list.data.overdueCount > 0 && (
              <span className="text-danger"> (마감 지난 미검수 {list.data.overdueCount}건)</span>
            )}
            {list.data.totalCount > list.data.items.length &&
              ` (앞의 ${list.data.items.length}건만 보여요)`}
          </p>
        </>
      )}

      <p className="text-label-md font-label-normal text-fg-tertiary">
        운영진 검수 대상에는 해당 챌린지의 방장·부방장 인증도 포함돼요.
      </p>
    </AdminCard>
  );
}

/** 챌린지별 검수 현황. 필터 선택지와 같은 응답이라 한 번만 받는다. */
function SummaryPanel() {
  const summaries = useReviewChallenges();
  return summaries.data ? <ChallengeSummary summaries={summaries.data} /> : null;
}

function FilterForm({ initial }: { initial: ReturnType<typeof parseFilters> }) {
  const router = useRouter();
  const challenges = useReviewChallenges();
  const [certDate, setCertDate] = useState(initial.certDate ?? "");
  const [challengeId, setChallengeId] = useState(
    initial.challengeId ? String(initial.challengeId) : "",
  );
  const [status, setStatus] = useState<ReviewStatusFilter>(initial.status);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (certDate) params.set("certDate", certDate);
    if (challengeId) params.set("challengeId", challengeId);
    if (status !== "PENDING") params.set("status", status);
    const query = params.toString();
    router.replace(query ? `/admin?${query}` : "/admin");
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="text-label-md font-label-normal text-fg-secondary flex flex-col gap-1">
        인증 날짜
        <input
          type="date"
          value={certDate}
          onChange={(event) => setCertDate(event.target.value)}
          className={controlClass}
        />
      </label>
      <label className="text-label-md font-label-normal text-fg-secondary flex flex-col gap-1">
        챌린지
        <select
          value={challengeId}
          onChange={(event) => setChallengeId(event.target.value)}
          className={`${controlClass} min-w-40`}
        >
          <option value="">전체 챌린지</option>
          {challenges.data?.map((option) => (
            <option key={option.challengeId} value={option.challengeId}>
              {option.title}
            </option>
          ))}
        </select>
      </label>
      <label className="text-label-md font-label-normal text-fg-secondary flex flex-col gap-1">
        검수 상태
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ReviewStatusFilter)}
          className={`${controlClass} min-w-40`}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="md" variant="outline">
        조회
      </Button>
    </form>
  );
}
