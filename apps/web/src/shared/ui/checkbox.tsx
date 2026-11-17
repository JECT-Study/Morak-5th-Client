"use client";

import { Check, Minus } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** 넘기면 체크박스 옆에 라벨을 그리고, 라벨을 눌러도 체크된다. */
  label?: ReactNode;
};

/**
 * 체크박스(Figma "Checkbox"). 상자 16px, 모서리 4, 선택 전 테두리 Line/Neutral/Primary, 선택 후 브랜드 색.
 * radix Checkbox라 Space로 토글되고, checked="indeterminate"(일부 선택)도 스크린리더에 "혼합"으로 읽힌다.
 * 상자는 작지만 label과 함께 쓰면 줄 전체가 눌리는 영역이 된다.
 */
export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  const box = (
    <CheckboxPrimitive.Root
      id={checkboxId}
      data-slot="checkbox"
      className={cn(
        "peer border-line bg-surface-primary text-fg-inverse rounded-4 flex size-4 shrink-0 items-center justify-center border transition-colors",
        "data-[state=checked]:border-surface-brand data-[state=checked]:bg-surface-brand",
        "data-[state=indeterminate]:border-surface-brand data-[state=indeterminate]:bg-surface-brand",
        "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:border-line-disabled disabled:bg-surface-disabled disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        {props.checked === "indeterminate" ? (
          <Minus aria-hidden className="size-3" strokeWidth={3} />
        ) : (
          <Check aria-hidden className="size-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) return box;
  return (
    <div className="flex min-h-6 items-center gap-2">
      {box}
      <label
        htmlFor={checkboxId}
        className="text-label-md font-label-normal text-fg-primary peer-disabled:text-fg-disabled min-w-0 flex-1 cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}
