"use client";

import { AlertDialog } from "radix-ui";

import { Button } from "@/shared/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  /** 확인 처리 중이면 두 버튼을 막는다 */
  pending?: boolean;
};

/**
 * 가운데에 뜨는 확인 모달. radix AlertDialog라 포커스 가두기·Esc 닫기를 하고,
 * 바깥을 눌러도 닫히지 않아 사용자가 두 버튼 중 하나를 꼭 고르게 한다.
 * TODO: Figma 모달 시안이 나오면 모양을 맞춘다.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="motion-safe:data-[state=open]:animate-fade-in motion-safe:data-[state=closed]:animate-fade-out fixed inset-0 z-40 bg-black/60" />
        <AlertDialog.Content className="bg-surface-primary rounded-16 motion-safe:data-[state=open]:animate-dialog-in motion-safe:data-[state=closed]:animate-dialog-out fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[343px] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 p-5 outline-none">
          <div className="flex flex-col gap-2 text-center">
            <AlertDialog.Title className="text-title-3 font-title text-fg-primary">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-body-md font-body-normal text-fg-secondary">
              {description}
            </AlertDialog.Description>
          </div>
          <div className="flex gap-2">
            <AlertDialog.Cancel asChild>
              <Button
                variant="subtle"
                className="min-w-0 flex-1"
                disabled={pending}
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            {/* Action은 누르면 바로 닫히므로, 확인 처리(권한 팝업 등)를 기다리도록 일반 버튼으로 둔다 */}
            <Button className="min-w-0 flex-1" disabled={pending} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
