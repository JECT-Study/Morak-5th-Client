"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { canGoBackInApp } from "@/shared/navigation/history";
import { IconButton } from "@/shared/ui/icon-button";

type AppHeaderProps = {
  title: string;
  /** 하위 화면이면 뒤로가기 버튼을 보인다. 탭 화면(root)은 false. */
  nested?: boolean;
  suffixAction?: ReactNode;
};

/**
 * 화면 상단 헤더. 상단에 고정한다.
 * - 위쪽은 노치(상태바) 영역 + 26px을 띄운다. Figma 모든 화면에서 상태바와 헤더 사이가 26px이다.
 * - 좌우 여백은 24px(뒤로가기 버튼은 누르는 영역이 넓어서 왼쪽으로 8px 당긴다).
 * - 배경은 부모(화면) 배경을 이어받아, 스크롤할 때 뒤 내용이 비치지 않게 한다.
 */
export default function AppHeader({ title, nested = false, suffixAction }: AppHeaderProps) {
  const router = useRouter();

  // 딥링크로 바로 들어와 앱 안 기록이 없으면 홈으로 보낸다.
  const handleBack = () => (canGoBackInApp() ? router.back() : router.replace("/"));

  return (
    <header className="sticky top-0 z-10 bg-inherit px-6 pt-[calc(env(safe-area-inset-top)+26px)]">
      <div className="flex h-12 items-center gap-1">
        {nested && (
          <IconButton aria-label="뒤로 가기" onClick={handleBack} className="-ml-2">
            <ArrowLeft aria-hidden />
          </IconButton>
        )}
        <h1 className="text-title-1 font-title text-fg-primary min-w-0 flex-1 truncate">{title}</h1>
        {suffixAction && <div className="flex shrink-0 items-center">{suffixAction}</div>}
      </div>
    </header>
  );
}
