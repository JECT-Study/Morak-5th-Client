"use client";

import { Dialog } from "radix-ui";

import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";

import { REJECT_REASON_MAX_LENGTH } from "../utils";

type RejectDialogProps = {
  open: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  /** 거절 확정을 보내는 중. 중복 제출을 막는다. */
  submitting: boolean;
  /** 저장 결과를 확인하지 못한 상태. 입력은 그대로 두고 버튼이 "최신 상태 확인"으로 바뀐다. */
  saveFailed: boolean;
  onConfirm: () => void;
  onCheckLatest: () => void;
  onCancel: () => void;
};

/**
 * 거절 사유 입력 창(Figma "‘거절’ 선택 → 사유 입력 창"). 사유는 제출자에게 그대로 보인다.
 * 바깥을 눌러도 닫히지 않는다(입력 중인 사유를 실수로 잃지 않도록). 취소·Esc로만 닫는다.
 */
export default function RejectDialog({
  open,
  reason,
  onReasonChange,
  submitting,
  saveFailed,
  onConfirm,
  onCheckLatest,
  onCancel,
}: RejectDialogProps) {
  const blank = reason.trim().length === 0;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && !submitting && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          onInteractOutside={(event) => event.preventDefault()}
          className="bg-surface-primary rounded-16 fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 p-6 outline-none"
        >
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-title-3 font-title text-fg-primary">
              인증을 거절할까요?
            </Dialog.Title>
            <Dialog.Description className="text-body-md font-body-normal text-fg-secondary">
              제출자가 확인할 수 있는 거절 사유를 작성해 주세요.
            </Dialog.Description>
            <p className="text-label-md font-label-normal text-fg-tertiary">
              대상은 인증 상세에서 선택한 인증이에요.
            </p>
          </div>

          {saveFailed && (
            <div
              role="alert"
              className="bg-surface-danger-subtle rounded-8 flex flex-col gap-1 p-3"
            >
              <p className="text-label-md font-label-strong text-danger">
                처리 결과를 확인하지 못했어요
              </p>
              <p className="text-label-md font-label-normal text-fg-secondary">
                최신 검수 상태를 확인한 뒤 다시 진행해 주세요. 입력한 사유는 그대로 남아 있어요.
              </p>
            </div>
          )}

          <TextField disabled={submitting}>
            <TextField.Label>거절 사유</TextField.Label>
            <TextField.Textarea
              rows={4}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              maxLength={REJECT_REASON_MAX_LENGTH}
              placeholder="예: 인증 사진에서 운동 시간을 확인할 수 없어요."
            />
            <TextField.Footer>
              <TextField.Helper>
                작성한 사유는 해당 인증을 제출한 사용자에게 표시돼요.
              </TextField.Helper>
              <TextField.Counter />
            </TextField.Footer>
          </TextField>

          <div className="flex justify-end gap-2">
            <Button variant="subtle" size="md" disabled={submitting} onClick={onCancel}>
              취소
            </Button>
            {saveFailed ? (
              <Button size="md" disabled={submitting} onClick={onCheckLatest}>
                최신 상태 확인
              </Button>
            ) : (
              <Button size="md" disabled={submitting || blank} onClick={onConfirm}>
                거절 확정
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
