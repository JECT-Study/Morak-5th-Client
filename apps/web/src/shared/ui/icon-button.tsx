import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 아이콘만 있는 버튼. 글자가 없으니 aria-label을 꼭 받는다.
 * 아이콘이 작아도 누르는 영역은 sm 32 / md 40 / lg 48로 둔다(터치 목표 크기).
 */
const iconButtonVariants = cva(
  [
    "text-fg-primary inline-flex shrink-0 items-center justify-center rounded-max transition-colors",
    "hover:bg-surface-secondary active:bg-surface-secondary-pressed",
    "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none",
    "disabled:text-fg-disabled disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "size-8 [&_svg]:size-5",
        md: "size-10 [&_svg]:size-6",
        lg: "size-12 [&_svg]:size-6",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> &
  VariantProps<typeof iconButtonVariants> & {
    /** 스크린리더가 읽을 버튼 이름. 예) "알림" */
    "aria-label": string;
  };

export function IconButton({ className, size, type, ...props }: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      type={type ?? "button"}
      className={cn(iconButtonVariants({ size }), className)}
      {...props}
    />
  );
}
