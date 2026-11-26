"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";

import {
  isAccessError,
  isAlreadyJudged,
  useApproveReview,
  useRejectReview,
  useReviewDetail,
} from "../api";
import {
  formatCertDate,
  formatDateTime,
  isOverdue,
  nicknameLabel,
  roleLabel,
  statusLabel,
} from "../utils";
import AccessDenied from "./access-denied";
import OverdueBadge from "./overdue-badge";
import PhotoViewer from "./photo-viewer";
import AdminCard from "./admin-card";
import { JudgeDoneCard, JudgeHistory } from "./judge-result";
import RejectDialog from "./reject-dialog";

type Judged = "APPROVED" | "REJECTED";

/** 인증 상세(Figma "인증 상세 → 원본·규칙 확인 → 승인 또는 거절"). */
export default function ReviewDetail({ certificationId }: { certificationId: number }) {
  const searchParams = useSearchParams();
  const listQuery = searchParams.toString();
  const listHref = listQuery ? `/admin?${listQuery}` : "/admin";

  const detail = useReviewDetail(certificationId);
  const approve = useApproveReview(certificationId);
  const reject = useRejectReview(certificationId);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  /** 이 화면에서 방금 판정한 결과 */
  const [judged, setJudged] = useState<Judged | null>(null);
  /** 판정하려는 사이 다른 운영진이 먼저 처리한 경우 */
  const [conflict, setConflict] = useState(false);
  /** 저장 요청의 성공·실패를 알 수 없는 경우 */
  const [saveFailed, setSaveFailed] = useState(false);

  if (isAccessError(detail.error)) {
    return (
      <AccessDenied
        unauthenticated={detail.error instanceof ApiError && detail.error.status === 401}
      />
    );
  }

  const header = (
    <>
      <Button asChild size="sm" variant="outline">
        <Link href={listHref} aria-label="검수 목록으로 돌아가기">
          <ChevronLeft aria-hidden />
          목록
        </Link>
      </Button>
      <h1 className="text-title-2 font-title text-fg-primary">인증 상세</h1>
    </>
  );

  if (detail.isPending) {
    return (
      <AdminCard header={header}>
        <p className="text-body-md text-fg-tertiary py-6 text-center">불러오는 중이에요.</p>
      </AdminCard>
    );
  }
  if (detail.isError) {
    const notFound = detail.error instanceof ApiError && detail.error.status === 404;
    return (
      <AdminCard header={header}>
        <p className="text-body-md text-danger">
          {notFound ? "검수할 인증을 찾을 수 없어요." : "인증 정보를 불러오지 못했어요."}
        </p>
        {!notFound && (
          <div>
            <Button size="sm" variant="outline" onClick={() => detail.refetch()}>
              다시 시도
            </Button>
          </div>
        )}
      </AdminCard>
    );
  }

  const data = detail.data;
  const pending = data.status === "PENDING" && judged === null;
  const submitting = approve.isPending || reject.isPending;

  const handleFailure = (error: unknown) => {
    if (isAlreadyJudged(error)) {
      // 먼저 처리된 판정을 유지한다. 입력 중이던 사유는 버리고 조회 전용으로 바꾼다.
      setRejectOpen(false);
      setConflict(true);
      setSaveFailed(false);
    } else {
      setSaveFailed(true);
    }
  };

  const onApprove = () => {
    setSaveFailed(false);
    approve.mutate(undefined, {
      onSuccess: () => setJudged("APPROVED"),
      onError: handleFailure,
    });
  };

  const onReject = () => {
    setSaveFailed(false);
    reject.mutate(reason.trim(), {
      onSuccess: () => {
        setRejectOpen(false);
        setJudged("REJECTED");
      },
      onError: handleFailure,
    });
  };

  /** 결과를 알 수 없을 때 서버의 최신 상태를 받아, 아직 미검수일 때만 다시 판정할 수 있게 한다. */
  const onCheckLatest = async () => {
    const latest = await detail.refetch();
    if (latest.data && latest.data.status !== "PENDING") {
      setRejectOpen(false);
      setConflict(true);
    }
    if (latest.data) setSaveFailed(false);
  };

  const field = (term: string, value: string, extra?: ReactNode) => (
    <div key={term} className="flex flex-col">
      <dt className="text-label-md font-label-normal text-fg-tertiary">{term}</dt>
      <dd className="text-body-md font-body-normal text-fg-primary">
        {value}
        {extra}
      </dd>
    </div>
  );

  return (
    <AdminCard header={header}>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <PhotoViewer urls={data.imageUrls} />
          <p className="text-label-md font-label-normal text-fg-tertiary">
            원본 사진을 확인한 뒤 오른쪽 인증 규칙과 비교해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3">
            {field("챌린지", data.challengeTitle)}
            {field(
              "제출자 / 역할",
              `${nicknameLabel(data.submitterNickname)} / ${roleLabel(data.submitterRole)}`,
            )}
            {field("인증 날짜", formatCertDate(data.certDate))}
            {field("제출 시각", formatDateTime(data.submittedAt))}
            {field("검수 상태", statusLabel(data.status))}
            {field(
              "검수 마감",
              formatDateTime(data.reviewDueAt),
              isOverdue(data.status, data.reviewDueAt) && <OverdueBadge />,
            )}
          </dl>
          <section className="border-line-subtle rounded-6 flex flex-col gap-1 border p-3">
            <h2 className="text-label-lg font-label-strong text-fg-primary">공통 미션</h2>
            <p className="text-body-md font-body-normal text-fg-primary">
              {data.commonMission ?? "등록된 공통 미션이 없어요."}
            </p>
            <h2 className="text-label-lg font-label-strong text-fg-primary mt-2">
              개설 시 정한 인증 방법·규칙
            </h2>
            <p className="text-body-md font-body-normal text-fg-primary">
              {data.verificationRules ?? "등록된 인증 규칙이 없어요."}
            </p>
          </section>
        </div>
      </div>

      <div className="border-line-subtle flex flex-col gap-3 border-t pt-4">
        {judged ? (
          <>
            <JudgeDoneCard approved={judged === "APPROVED"} />
            {judged === "REJECTED" && data.judge?.rejectReason && (
              <JudgeHistory detail={data} title="처리 결과" />
            )}
            <div>
              <Button asChild size="md" variant="outline">
                <Link href={listHref}>검수 목록으로</Link>
              </Button>
            </div>
          </>
        ) : pending ? (
          <>
            {saveFailed && !rejectOpen && (
              <div
                role="alert"
                className="bg-surface-danger-subtle rounded-8 flex flex-col gap-1 p-3"
              >
                <p className="text-label-md font-label-strong text-danger">
                  처리 결과를 확인하지 못했어요
                </p>
                <p className="text-label-md font-label-normal text-fg-secondary">
                  최신 검수 상태를 확인한 뒤 다시 진행해 주세요. 미검수인 경우에만 다시 판정할 수
                  있어요.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="md" disabled={submitting} onClick={onApprove}>
                승인
              </Button>
              <Button
                size="md"
                variant="outline"
                disabled={submitting}
                onClick={() => setRejectOpen(true)}
              >
                거절
              </Button>
              {saveFailed && !rejectOpen && (
                <Button size="md" variant="outline" onClick={onCheckLatest}>
                  최신 상태 확인
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <JudgeHistory
              detail={data}
              title={conflict ? "이미 처리된 인증이에요" : "처리 결과"}
              description={
                conflict ? "다른 운영진이 먼저 판정했어요. 최신 결과를 확인해 주세요." : undefined
              }
            />
            <p className="text-label-md font-label-normal text-fg-tertiary">
              기존 판정을 유지해요. 승인·거절·재확정은 할 수 없어요.
            </p>
            <div>
              <Button asChild size="md" variant="outline">
                <Link href={listHref}>검수 목록으로</Link>
              </Button>
            </div>
          </>
        )}
      </div>

      <RejectDialog
        open={rejectOpen}
        reason={reason}
        onReasonChange={setReason}
        submitting={reject.isPending}
        saveFailed={saveFailed}
        onConfirm={onReject}
        onCheckLatest={onCheckLatest}
        onCancel={() => setRejectOpen(false)}
      />
    </AdminCard>
  );
}
