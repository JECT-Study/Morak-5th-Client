"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

import { TAB_HREFS } from "./tab-bar";

/** 새 탭 내용이 들어오는 거리(화면 폭 대비)와 시간. 카카오톡처럼 짧고 빠르게 "툭" 나타난다. */
const OFFSET = "16%";
const DURATION_MS = 180;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

/**
 * 하단 탭을 옮길 때 새 탭 내용만 옆에서 짧게 밀려 들어온다. 이전 화면은 바로 사라져 겹치지 않는다.
 * 오른쪽 탭으로 가면 오른쪽에서, 왼쪽 탭으로 가면 왼쪽에서 들어온다.
 * 처음 열 때, 탭이 아닌 화면에서 돌아올 때, "움직임 줄이기"를 켠 경우에는 움직이지 않는다.
 * 다시 그리지 않고(Web Animations API) 움직임만 주어 화면 상태가 그대로 유지된다.
 */
export default function TabTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const previousIndex = useRef<number | null>(null);

  // 새 화면이 그려진 직후, 칠하기 전에 시작해야 원래 자리에서 한 번 보이는 깜빡임이 없다.
  useLayoutEffect(() => {
    const index = TAB_HREFS.indexOf(pathname);
    const previous = previousIndex.current;
    previousIndex.current = index;
    if (previous === null || previous < 0 || index < 0 || previous === index) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = index > previous ? OFFSET : `-${OFFSET}`;
    ref.current?.animate(
      [
        { translate: `${from} 0`, opacity: 0 },
        { translate: "0 0", opacity: 1 },
      ],
      { duration: DURATION_MS, easing: EASING },
    );
  }, [pathname]);

  return (
    <div ref={ref} className="flex flex-1 flex-col bg-inherit">
      {children}
    </div>
  );
}
