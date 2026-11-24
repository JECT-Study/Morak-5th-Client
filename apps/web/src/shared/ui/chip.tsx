import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 필터·카테고리 선택용 칩(Figma "Chip"). 예) 진행 중, 운동, 독서.
 * 켜고 끄는 버튼이라 선택 상태를 aria-pressed로 알린다.
 * 여러 개 중 하나만 고르는 경우에는 SegmentedControl(radio)을 쓴다.
 * 크기 md 32 / sm 24, 좌우 여백 12 / 8, 모서리 16 / 12.
 */
const chipVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1 border border-transparent whitespace-nowrap",
    "transition-[color,background-color,border-color,scale] duration-150 motion-safe:active:scale-96",
    "bg-surface-secondary text-fg-secondary font-label-normal",
    "hover:bg-surface-secondary-hover hover:text-fg-secondary-hover",
    "active:bg-surface-secondary-pressed active:text-fg-secondary-pressed",
    "aria-pressed:border-line-brand aria-pressed:bg-surface-selected aria-pressed:text-fg-brand-strong aria-pressed:font-label-strong",
    "disabled:bg-surface-disabled disabled:text-fg-disabled disabled:pointer-events-none",
    "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none",
  ],
  {
    variants: {
      size: {
        md: "text-label-md h-8 rounded-16 px-3",
        sm: "text-label-sm h-6 rounded-12 px-2",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type ChipProps = Omit<ComponentProps<"button">, "aria-pressed"> &
  VariantProps<typeof chipVariants> & {
    /** 고른 칩이면 true */
    selected?: boolean;
  };

export function Chip({ className, size, selected = false, type, ...props }: ChipProps) {
  return (
    <button
      data-slot="chip"
      type={type ?? "button"}
      aria-pressed={selected}
      className={cn(chipVariants({ size }), className)}
      {...props}
    />
  );
}
