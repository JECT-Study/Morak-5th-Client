import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { formatAppliedAt } from "../format";
import type { ParticipationRequest } from "../types";

type CardProps = { request: ParticipationRequest; children?: ReactNode; aside?: ReactNode };

/** 신청 카드 공통 틀: 프로필·닉네임·신청 시각 → 각오 한마디 → (아래 내용). Figma "Request card" */
function CardFrame({ request: { applicant, appliedAt, message }, children, aside }: CardProps) {
  return (
    <li className="border-line-subtle rounded-12 bg-surface-primary flex flex-col gap-3 border p-4">
      <div className="flex items-center gap-3">
        {/* TODO: 프로필 사진·신청자 프로필 화면(위키 5.5)이 정해지면 바꾼다 */}
        <span
          aria-hidden
          className="text-label-lg font-label-normal flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eae7fa] text-[#20252b]"
        >
          {applicant.nickname.charAt(0)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-label-lg font-label-normal text-fg-primary truncate">
            {applicant.nickname}
          </span>
          <span className="text-label-xs text-fg-tertiary">{formatAppliedAt(appliedAt)} 신청</span>
        </div>
        {aside}
      </div>
      {message && (
        <p className="text-body-sm font-body-normal text-fg-secondary rounded-10 bg-surface-secondary p-4 break-keep">
          {message}
        </p>
      )}
      {children}
    </li>
  );
}

type PendingCardProps = {
  request: ParticipationRequest;
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onConfirmInvalid: () => void;
};

/** 대기중 탭 카드. 한도 초과로 무효가 된 신청은 승인할 수 없고 확인만 한다(위키 5.5). */
export function PendingRequestCard({
  request,
  pending,
  onApprove,
  onReject,
  onConfirmInvalid,
}: PendingCardProps) {
  if (request.status === "INVALIDATED") {
    return (
      <CardFrame request={request}>
        <p className="text-label-sm font-label-normal text-fg-caution">
          해당 사용자가 참여할 수 있는 챌린지가 초과되었습니다. 확인하면 승인 대기 목록에서 이
          신청이 사라져요.
        </p>
        <Button variant="outline" size="md" fullWidth disabled={pending} onClick={onConfirmInvalid}>
          확인
        </Button>
      </CardFrame>
    );
  }

  return (
    <CardFrame request={request}>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          disabled={pending}
          onClick={onReject}
        >
          거절하기
        </Button>
        <Button size="md" className="flex-1" disabled={pending} onClick={onApprove}>
          승인하기
        </Button>
      </div>
    </CardFrame>
  );
}

const RESULT_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "참여 확정", className: "bg-success/15 text-success" },
  REJECTED: { label: "거절됨", className: "bg-danger/15 text-danger" },
};

/**
 * 처리 완료 탭 카드. Figma "Processed card"(참여 승인).
 * TODO: 처리 시각(예: "10월 21일 07:55 승인")은 응답에 없어 백엔드가 주면 붙인다.
 */
export function ProcessedRequestCard({ request }: { request: ParticipationRequest }) {
  const badge = RESULT_BADGE[request.status];
  return (
    <CardFrame
      request={request}
      aside={
        badge && (
          <Badge size="sm" className={cn("font-label-normal", badge.className)}>
            {badge.label}
          </Badge>
        )
      }
    />
  );
}
