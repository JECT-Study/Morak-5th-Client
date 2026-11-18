import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 불러오는 동안 내용 자리를 채우는 뼈대(shadcn Skeleton). Tailwind animate-pulse로 깜빡인다.
 * 크기·모양은 className으로 정한다. 예) <Skeleton className="h-6 w-2/3" />
 * 스크린리더에는 감싼 영역의 aria-busy·aria-label로 알리고, 뼈대 자체는 읽지 않는다.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn("bg-surface-tertiary rounded-4 animate-pulse", className)}
      {...props}
    />
  );
}
