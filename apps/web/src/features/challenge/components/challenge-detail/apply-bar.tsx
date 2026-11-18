"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";
import { formatPoint } from "@/features/point/format";
import { usePointLedger } from "@/features/point/use-point-ledger";
import { ApiError } from "@/shared/api/client";
import BottomSheet from "@/shared/ui/bottom-sheet";
import { Button } from "@/shared/ui/button";
import FormTextarea from "@/shared/ui/form-textarea";

import type { ChallengeView } from "../../types";
import { useApplyChallenge } from "../../use-apply-challenge";

/** 지원서(각오 한마디) 최대 글자 수. 백엔드 ApplyRequest @Size(max = 200) */
const MESSAGE_MAX = 200;

const applyErrorMessage = (error: Error) => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "PARTICIPATION_ALREADY_APPLIED":
        return "이미 신청했거나 참여 중인 챌린지예요.";
      case "PARTICIPATION_CHALLENGE_FULL":
        return "정원이 가득 차서 신청할 수 없어요.";
      case "PARTICIPATION_CHALLENGE_NOT_RECRUITING":
        return "지금은 모집 중이 아니에요.";
      case "PARTICIPATION_PARTICIPATION_LIMIT_EXCEEDED":
        return "참여할 수 있는 챌린지 수를 넘었어요.";
      case "POINT_002":
        return "포인트가 부족해요.";
    }
  }
  return "신청하지 못했어요. 다시 시도해 주세요.";
};

/**
 * 챌린지 상세 하단 버튼(위키 4.2). Figma "챌린지 상세 (진행중 x)"의 "참여 신청하기".
 * - 신청할 수 있으면 "참여 신청하기" → 지원서 시트
 * - 승인 대기 중이면 비활성 "승인 대기 중"
 * - 로그인하지 않았으면 누를 때 로그인으로 보낸다
 * 참여가 확정됐거나 신청할 수 없는 상태면 버튼을 그리지 않는다.
 */
export default function ApplyBar({ challenge }: { challenge: ChallengeView }) {
  const router = useRouter();
  const { data: me, isPending: meLoading } = useMyInfo();
  const [open, setOpen] = useState(false);

  const status = challenge.myParticipationStatus;
  const recruiting = challenge.status === "RECRUITING" || challenge.status === "START_HELD";

  let button: { label: string; disabled: boolean; onClick?: () => void } | null = null;
  if (status === "PENDING") {
    button = { label: "승인 대기 중", disabled: true };
  } else if (challenge.canApply) {
    button = { label: "참여 신청하기", disabled: false, onClick: () => setOpen(true) };
  } else if (!me && !meLoading && recruiting && status === null) {
    button = { label: "참여 신청하기", disabled: false, onClick: () => router.push("/login") };
  }
  if (!button) return null;

  return (
    <>
      <div className="bg-background-primary sticky bottom-0 mt-auto px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Button size="md" fullWidth disabled={button.disabled} onClick={button.onClick}>
          {button.label}
        </Button>
      </div>
      {challenge.canApply && (
        <ApplySheet open={open} onOpenChange={setOpen} challenge={challenge} />
      )}
    </>
  );
}

type ApplySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: ChallengeView;
};

/**
 * 지원서 시트. 각오 한마디(선택)를 적고 신청한다. 포인트 챌린지는 신청과 함께 포인트를 건다(위키 5.4).
 * TODO: 지원서 시안이 나오면 맞춘다. 잔액 부족 시 광고·출석 안내 화면도 이어 붙인다.
 */
function ApplySheet({ open, onOpenChange, challenge }: ApplySheetProps) {
  const [message, setMessage] = useState("");
  const apply = useApplyChallenge(String(challenge.id));
  const usesPoint = challenge.pointAmount > 0;
  const { data: ledger } = usePointLedger();
  const balance = ledger?.pages[0]?.balance;
  const short = usesPoint && balance !== undefined && balance < challenge.pointAmount;

  const submit = () => {
    const trimmed = message.trim();
    apply.mutate(trimmed ? { message: trimmed } : {}, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => !apply.isPending && onOpenChange(next)}
      title="참여 신청"
    >
      <FormTextarea
        label="각오 한마디"
        placeholder="방장에게 전할 한마디를 적어 주세요. (선택)"
        maxLength={MESSAGE_MAX}
        rows={3}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      {usesPoint && (
        <div className="bg-surface-secondary rounded-12 flex flex-col gap-1 p-4">
          <p className="text-body-sm font-body-normal text-fg-primary">
            참여 포인트 {formatPoint(challenge.pointAmount)}를 걸고 신청해요.
          </p>
          <p className="text-label-sm text-fg-tertiary">
            {balance !== undefined && `보유 ${formatPoint(balance)} · `}승인되지 않으면 전액
            돌려드려요.
          </p>
          {short && (
            <p className="text-label-sm text-danger">
              포인트가 부족해요. 포인트를 모은 뒤 다시 신청해 주세요.
            </p>
          )}
        </div>
      )}

      {apply.isError && (
        <p role="alert" className="text-label-sm text-danger">
          {applyErrorMessage(apply.error)}
        </p>
      )}

      <Button fullWidth disabled={apply.isPending || short} onClick={submit}>
        {usesPoint ? "포인트를 걸고 신청" : "신청하기"}
      </Button>
    </BottomSheet>
  );
}
