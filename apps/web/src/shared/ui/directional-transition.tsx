import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

/** 화면이 넘어가는 방향 */
export type NavDirection = "nav-forward" | "nav-back";

type DirectionalTransitionProps = {
  /** 이번에 들어온 방향. null이면(처음 그릴 때) 움직이지 않는다. */
  direction: NavDirection | null;
  children: ReactNode;
};

/**
 * 새 화면이 흰 바탕 위로 옆에서 밀려 들어온다. 앞으로 가면 오른쪽에서, 뒤로 가면 왼쪽에서.
 * 부모가 key를 바꿔 새로 그리면 이전 화면은 바로 사라지고 새 화면만 움직인다.
 * View Transition API는 iOS 웹뷰에서 클래스 규칙을 지원하지 않아 겹쳐 보여서, 평범한 CSS 애니메이션으로 한다.
 * 애니메이션 모양은 globals.css의 .slide-in-from-right / .slide-in-from-left에 있다.
 */
export function DirectionalTransition({ direction, children }: DirectionalTransitionProps) {
  return (
    <div
      className={cn(
        "bg-background-primary flex flex-1 flex-col",
        direction === "nav-forward" && "slide-in-from-right",
        direction === "nav-back" && "slide-in-from-left",
      )}
    >
      {children}
    </div>
  );
}
