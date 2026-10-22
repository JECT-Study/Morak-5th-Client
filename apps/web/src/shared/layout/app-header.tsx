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

/** 화면 상단 헤더(JDS LocalNavigation). 좌우 여백은 JDS 기본값(margin-lg)을 쓰고, 노치 영역만큼 내려서 상단에 고정한다. */
export default function AppHeader({ title, nested = false, suffixAction }: AppHeaderProps) {
  const router = useRouter();

  // 딥링크로 바로 들어와 앱 안 기록이 없으면 홈으로 보낸다.
  const handleBack = () => (canGoBackInApp() ? router.back() : router.replace("/"));

  return (
    <header className="bg-surface-standard sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
      {nested ? (
        <LocalNavigation
          nested
          title={title}
          titleAs="h1"
          onBackClick={handleBack}
          suffixAction={suffixAction}
        />
      ) : (
        <LocalNavigation title={title} titleAs="h1" suffixAction={suffixAction} />
      )}
    </header>
  );
}
