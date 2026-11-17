import { type ReactNode, ViewTransition } from "react";

/** 화면이 넘어가는 방향. 이동할 때 addTransitionType으로 붙인다. */
export type NavDirection = "nav-forward" | "nav-back";

/**
 * 앞으로 가면 오른쪽에서, 뒤로 가면 왼쪽에서 밀려 들어온다.
 * 애니메이션 모양은 globals.css의 ::view-transition-old/new(.nav-forward / .nav-back)에 있다.
 * 방향 타입이 없는 변경(일반 setState, 데이터 갱신 등)은 움직이지 않는다(default: "none").
 */
export function DirectionalTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
