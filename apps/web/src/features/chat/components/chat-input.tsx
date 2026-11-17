"use client";

import { ArrowUp, LockKeyhole } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { cn } from "@/shared/lib/utils";

type ChatInputProps = {
  /** 보내기에 성공하면(대기열에 들어가면) true를 돌려준다. 그때만 입력을 비운다. */
  onSend: (text: string) => boolean;
  /** 연결 전이면 보낼 수 없다 */
  disabled: boolean;
};

/**
 * 메시지 입력(Figma "bottom_message"). 회색 칸 안에 원형 보내기 버튼.
 * 한글 조합 중 Enter는 글자를 확정하는 키라 보내지 않는다.
 */
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const canSend = !disabled && text.trim().length > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canSend && onSend(text)) setText("");
  };

  const preventComposingSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault();
  };

  return (
    <form
      onSubmit={submit}
      className="bg-background-primary sticky bottom-0 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)]"
    >
      <div className="bg-surface-secondary rounded-12 focus-within:ring-line-focus flex h-12 items-center gap-2 py-2.5 pr-1.5 pl-2.5 focus-within:ring-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={preventComposingSubmit}
          maxLength={1000}
          enterKeyHint="send"
          aria-label="메시지 입력"
          placeholder={disabled ? "연결되면 보낼 수 있어요." : "메시지를 입력해주세요."}
          className="text-body-lg font-body-normal text-fg-primary placeholder:text-fg-disabled min-w-0 flex-1 bg-transparent outline-none"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={!canSend}
          className={cn(
            "rounded-max flex size-[34px] shrink-0 items-center justify-center transition-colors",
            "bg-surface-brand text-fg-inverse hover:bg-surface-brand-hover active:bg-surface-brand-pressed",
            "disabled:bg-surface-disabled disabled:text-fg-disabled",
            "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          <ArrowUp aria-hidden className="size-5" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}

const READ_ONLY_TEXT = {
  ended: "종료된 챌린지의 채팅기록입니다.",
  left: "퇴장 전 까지의 채팅 기록만 확인 할 수 있어요.",
} as const;

export type ReadOnlyReason = keyof typeof READ_ONLY_TEXT;

/** 읽기 전용 안내(Figma "Chat Notice"). 입력창 자리에 보여준다. */
export function ChatReadOnlyNotice({ reason }: { reason: ReadOnlyReason }) {
  return (
    <div className="bg-surface-secondary sticky bottom-0 flex items-center justify-center gap-2 p-2.5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <LockKeyhole aria-hidden className="text-fg-secondary size-5" />
      <p role="status" className="text-body-lg font-body-strong text-fg-secondary">
        {READ_ONLY_TEXT[reason]}
      </p>
    </div>
  );
}
