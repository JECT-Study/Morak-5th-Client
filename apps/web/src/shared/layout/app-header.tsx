"use client";

import { LocalNavigation } from "@jects/jds";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { canGoBackInApp } from "@/shared/navigation/history";

type AppHeaderProps = {
  title: string;
  /** 하위 화면이면 뒤로가기 버튼을 보인다. 탭 화면(root)은 false. */
  nested?: boolean;
  suffixAction?: ReactNode;
};

/**
 * 화면 상단 헤더(JDS LocalNavigation). 상단에 고정한다.
 * - 위쪽은 노치(상태바) 영역 + 26px을 띄운다. Figma 모든 화면에서 상태바와 헤더 사이가 26px이다.
 * - Figma처럼 화면 좌우 여백(24px)을 바깥에서 주고 LocalNavigation은 stretched로 둔다.
 * - 배경은 부모(화면) 배경을 이어받아, 스크롤할 때 뒤 내용이 비치지 않게 한다.
 */
export default function AppHeader({ title, nested = false, suffixAction }: AppHeaderProps) {
  const router = useRouter();

  // 딥링크로 바로 들어와 앱 안 기록이 없으면 홈으로 보낸다.
  const handleBack = () => (canGoBackInApp() ? router.back() : router.replace("/"));

  return (
    <header className="sticky top-0 z-10 bg-inherit px-6 pt-[calc(env(safe-area-inset-top)+26px)]">
      {nested ? (
        <LocalNavigation
          nested
          stretched
          title={title}
          titleAs="h1"
          onBackClick={handleBack}
          suffixAction={suffixAction}
        />
      ) : (
        <LocalNavigation stretched title={title} titleAs="h1" suffixAction={suffixAction} />
      )}
    </header>
  );
}
