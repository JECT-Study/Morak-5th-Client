import type { ReactNode } from "react";

import TabBar from "@/shared/layout/tab-bar";
import TabTransition from "@/shared/layout/tab-transition";

/**
 * 하단 탭바가 있는 화면. 탭바(84px + 하단 안전 영역)에 내용이 가리지 않게 아래 여백을 둔다.
 * 헤더가 bg-inherit로 화면 배경을 이어받을 수 있게 배경도 이어받는다.
 * 탭을 옮기면 새 탭 내용이 옆에서 짧게 들어온다(TabTransition). 옆으로 밀린 동안 가로 스크롤이 생기지 않게 자른다.
 */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col overflow-x-clip bg-inherit pb-[calc(84px+env(safe-area-inset-bottom))]">
        <TabTransition>{children}</TabTransition>
      </div>
      <TabBar />
    </>
  );
}
