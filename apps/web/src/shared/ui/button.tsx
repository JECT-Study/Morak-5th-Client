import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 모락 버튼(Figma "Button").
 * - primary: 화면에서 가장 중요한 행동(예: 챌린지 참여하기)
 * - subtle: 덜 중요한 강조 행동(예: 포인트 받기)
 * - outline: 보조 행동(예: 인증 내역 보기)
 * 크기 lg 48 / md 40 / sm 32, 좌우 여백 20 / 16 / 12, 모서리 12 / 12 / 8.
 * Figma 컴포넌트의 Brand(primary), Brand-weak(subtle), Outlined Neutral(outline)에 맞췄다.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap",
    // 누르는 동안 살짝 작아져 눌린 느낌을 준다. 비활성이면 pointer-events가 없어 줄어들지 않는다.
    "transition-[color,background-color,border-color,scale] duration-150 motion-safe:active:scale-98",
    "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:pointer-events-none aria-disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-surface-brand text-fg-inverse hover:bg-surface-brand-hover active:bg-surface-brand-pressed",
          "disabled:bg-surface-tertiary disabled:text-fg-disabled",
        ],
        subtle: [
          "bg-surface-brand-subtle text-fg-brand-strong hover:bg-surface-brand-subtle-hover",
          "active:bg-surface-brand-subtle-pressed active:text-fg-brand-pressed",
          "disabled:bg-surface-disabled disabled:text-fg-disabled",
        ],
        outline: [
          "border-line bg-surface-primary text-fg-primary border hover:bg-surface-secondary active:bg-surface-secondary-pressed",
          "disabled:border-line-disabled disabled:text-fg-disabled",
        ],
      },
      size: {
        lg: "text-label-lg font-label-strong rounded-12 h-12 gap-2 px-5 [&_svg]:size-5",
        md: "text-label-md font-label-strong rounded-12 h-10 px-4 [&_svg]:size-5",
        sm: "text-label-sm font-label-strong rounded-8 h-8 px-3 [&_svg]:size-4",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** true면 자식 요소(예: next/link의 Link)에 버튼 모양을 입힌다. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      // form 안에서 실수로 submit이 되지 않게 기본값을 button으로 둔다.
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}
