"use client";

import { Info, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useChallenge } from "@/features/challenge/use-challenge";
import { formatPoint } from "@/features/point/format";
import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Skeleton } from "@/shared/ui/skeleton";

import type { ParticipationRequest, RequestAction } from "../types";
import {
  useDecideParticipationRequest,
  useParticipationRequests,
} from "../use-participation-requests";
import { PendingRequestCard, ProcessedRequestCard } from "./request-card";

/** 처리 실패 문구. 409는 목록이 바뀐 경우라 다시 불러온 목록을 보여 준다. */
const errorMessage = (error: Error) => {
  if (error instanceof ApiError) {
    if (error.code === "PARTICIPATION_CHALLENGE_FULL") return "정원이 가득 차서 승인할 수 없어요.";
    if (error.status === 409) return "신청 상태가 바뀌었어요. 목록을 다시 확인해 주세요.";
    if (error.status === 403) return "방장만 신청을 처리할 수 있어요.";
  }
  return "처리하지 못했어요. 다시 시도해 주세요.";
};

const listErrorMessage = (error: Error) =>
  error instanceof ApiError && error.status === 403
    ? "방장만 볼 수 있어요."
    : "신청 목록을 불러오지 못했어요.";

type Decision = { request: ParticipationRequest; action: "approve" | "reject" };

/**
 * 방장 전용 참여 신청 관리. Figma "04. 방장 전용 관리 화면 — 참여 신청 관리".
 * - 대기중: 승인 대기 + 확인 전 무효 신청. 승인·거절은 확인 팝업을 거친다.
 * - 처리 완료: 승인(참여 확정)·거절한 신청.
 * 거절 사유 입력은 1차 MVP 범위가 아니다(시안 메모).
 */
export default function ParticipationRequestsScreen() {
  const { id } = useParams<{ id: string }>();
  const { data: challenge } = useChallenge(id);
  const pendingList = useParticipationRequests(id, "PENDING");
  const approvedList = useParticipationRequests(id, "ACTIVE");
  const rejectedList = useParticipationRequests(id, "REJECTED");
  const decide = useDecideParticipationRequest(id);
  const [decision, setDecision] = useState<Decision | null>(null);

  const run = (request: ParticipationRequest, action: RequestAction) =>
    decide.mutate(
      { participationId: request.participationId, action },
      { onSettled: () => setDecision(null) },
    );

  const pendingItems = pendingList.data?.items ?? [];
  // 처리 완료는 최근에 신청한 순으로 보여 준다(서버는 오래된 순).
  const processedItems = [
    ...(approvedList.data?.items ?? []),
    ...(rejectedList.data?.items ?? []),
  ].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const pointAmount = challenge?.pointAmount ?? 0;

  return (
    <Tabs defaultValue="pending" className="flex flex-1 flex-col">
      <TabsList>
        <TabsTrigger value="pending" className="text-label-md h-9">
          대기중{pendingList.data ? ` ${pendingItems.length}` : ""}
        </TabsTrigger>
        <TabsTrigger value="processed" className="text-label-md h-9">
          처리 완료
        </TabsTrigger>
      </TabsList>

      <p className="text-label-sm text-fg-tertiary flex items-center gap-2 px-6 py-3">
        <Info aria-hidden className="size-4 shrink-0" />
        {/* TODO: 문구는 PM 확인 전 임시. 참여 포인트는 신청할 때 이미 걸어 둔다(백엔드 위키). */}
        {pointAmount > 0
          ? `신청자는 참여 포인트 ${formatPoint(pointAmount)}를 걸고 신청했어요. 거절하면 전액 돌려줘요.`
          : "승인하면 신청자에게 알림이 가고 참여가 바로 확정돼요."}
      </p>

      {decide.isError && (
        <p role="alert" className="text-label-sm text-danger px-6 pb-2">
          {errorMessage(decide.error)}
        </p>
      )}

      <TabsContent value="pending" className="flex flex-col">
        {challenge && (
          <div className="px-6">
            <div className="rounded-12 flex items-center gap-3 px-4 py-3">
              <span className="bg-surface-tertiary flex size-10 shrink-0 items-center justify-center rounded-full">
                <Users aria-hidden className="text-fg-secondary size-6" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-body-sm font-body-normal text-fg-primary">
                  현재 확정 {challenge.currentCount}/{challenge.capacity}명
                </p>
                <p className="text-label-sm text-fg-tertiary">승인 즉시 참여가 확정돼요.</p>
              </div>
            </div>
          </div>
        )}
        <RequestList
          query={pendingList}
          empty="승인을 기다리는 신청이 없어요."
          items={pendingItems}
          render={(request) => (
            <PendingRequestCard
              key={request.participationId}
              request={request}
              pending={decide.isPending}
              onApprove={() => setDecision({ request, action: "approve" })}
              onReject={() => setDecision({ request, action: "reject" })}
              onConfirmInvalid={() => run(request, "confirm-invalid")}
            />
          )}
        />
      </TabsContent>

      <TabsContent value="processed" className="flex flex-col">
        <RequestList
          query={{
            isPending: approvedList.isPending || rejectedList.isPending,
            error: approvedList.error ?? rejectedList.error,
            refetch: () => Promise.all([approvedList.refetch(), rejectedList.refetch()]),
            isRefetching: approvedList.isRefetching || rejectedList.isRefetching,
          }}
          empty="처리한 신청이 없어요."
          items={processedItems}
          render={(request) => (
            <ProcessedRequestCard key={request.participationId} request={request} />
          )}
        />
      </TabsContent>

      {/* TODO: 문구는 PM 확인 전 임시 */}
      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(open) => !open && !decide.isPending && setDecision(null)}
        title={
          decision?.action === "reject"
            ? `${decision.request.applicant.nickname}님의 참여 신청을 거절할까요?`
            : `${decision?.request.applicant.nickname ?? ""}님의 참여 신청을 승인할까요?`
        }
        description={
          decision?.action === "reject"
            ? `거절하면 신청자에게 알림이 가요.${pointAmount > 0 ? " 걸어 둔 참여 포인트는 전액 돌려줘요." : ""}`
            : "승인하면 신청자에게 알림이 가고, 참여가 바로 확정돼요."
        }
        confirmLabel={decision?.action === "reject" ? "거절하기" : "승인하기"}
        onConfirm={() => decision && run(decision.request, decision.action)}
        pending={decide.isPending}
      />
    </Tabs>
  );
}

type RequestListProps = {
  query: { isPending: boolean; error: Error | null; refetch: () => unknown; isRefetching: boolean };
  items: ParticipationRequest[];
  empty: string;
  render: (request: ParticipationRequest) => ReactNode;
};

function RequestList({ query, items, empty, render }: RequestListProps) {
  if (query.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="신청 목록을 불러오는 중"
        className="flex flex-col gap-3 px-6 pt-3"
      >
        {[0, 1].map((key) => (
          <Skeleton key={key} className="rounded-12 h-40" />
        ))}
      </div>
    );
  }
  if (query.error) {
    const retryable = !(query.error instanceof ApiError && query.error.status === 403);
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16">
        <p className="text-body-md font-body-normal text-fg-tertiary">
          {listErrorMessage(query.error)}
        </p>
        {retryable && (
          <Button
            variant="outline"
            size="md"
            onClick={() => query.refetch()}
            disabled={query.isRefetching}
          >
            다시 시도
          </Button>
        )}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p className="text-body-md font-body-normal text-fg-tertiary px-6 py-16 text-center">
        {empty}
      </p>
    );
  }
  return <ul className="flex flex-col gap-3 px-6 pt-3 pb-8">{items.map(render)}</ul>;
}
