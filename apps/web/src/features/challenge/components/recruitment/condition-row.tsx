import type { ReactNode } from "react";

import RequiredMark from "@/shared/ui/required-mark";

type ConditionRowProps = {
  /** 라벨과 조작 요소를 잇는 id. 라벨을 aria-labelledby로 연결할 때 쓴다. */
  id: string;
  label: string;
  description: string;
  required?: boolean;
  error?: string;
  /** 오른쪽 조작 요소(세그먼트, 스테퍼) */
  children: ReactNode;
};

/** 모집 조건의 한 줄. 왼쪽에 라벨·설명, 오른쪽에 조작 요소를 둔다. */
export default function ConditionRow({
  id,
  label,
  description,
  required,
  error,
  children,
}: ConditionRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span
            id={`${id}-label`}
            className="text-label-sm font-label-normal text-object-neutral flex items-start gap-0.5"
          >
            {label}
            {required && <RequiredMark />}
          </span>
          <span
            id={`${id}-description`}
            className="text-label-xs font-label-subtle text-object-alternative break-keep"
          >
            {description}
          </span>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
      {error && (
        <p
          role="alert"
          className="text-label-sm text-(--color-semantic-feedback-destructive-normal)"
        >
          {error}
        </p>
      )}
    </div>
  );
}
