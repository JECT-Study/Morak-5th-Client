import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 상태·숫자를 붙이는 작은 표시(Figma "Badge"). 예) D-3, 진행 중, 82%. 누르는 요소가 아니다.
 * - brand: 가장 강한 강조. 흰 글자 대비가 2.96:1이라 짧은 숫자·기호에만 쓴다.
 * - subtle: 기본 브랜드 배지 / neutral: 일반 정보 / inverse: 어두운 강조
 * - outline: 테두리만 있는 태그(예: 데일리 · 비공개). TODO: Figma에 아직 없어 JDS outlined 자리를 잇는다.
 * 크기 md 24 / sm 20, 좌우 여백 8, 모서리 4.
 */
const badgeVariants = cva(
  "text-label-sm font-label-strong inline-flex shrink-0 items-center justify-center gap-0.5 rounded-4 px-2 whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        brand: "bg-surface-brand text-fg-inverse",
        subtle: "bg-surface-brand-subtle text-fg-brand-strong",
        neutral: "bg-surface-tertiary text-fg-secondary",
        inverse: "bg-surface-inverse text-fg-inverse",
        outline: "border-line bg-surface-primary text-fg-secondary border",
      },
      size: {
        md: "h-6",
        sm: "h-5",
      },
    },
    defaultVariants: { variant: "subtle", size: "md" },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
