"use client";

import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { canGoBackInApp } from "@/shared/navigation/history";
import { IconButton } from "@/shared/ui/icon-button";

type AppHeaderProps = {
  title: string;
  /** 하위 화면이면 뒤로가기 버튼을 보인다. 탭 화면(root)은 false. */
  nested?: boolean;
  /**
   * true면 새 디자인 시스템 헤더(Figma 온보딩 Header): 높이 56, 제목 가운데, 아래 구분선.
   * TODO: 다른 화면 시안도 이 모양으로 바뀌면 기본값으로 바꾼다.
   */
  centered?: boolean;
  /** 뒤로가기를 직접 처리할 때(예: 온보딩 단계 되돌리기). 없으면 브라우저 뒤로가기 */
  onBack?: () => void;
  suffixAction?: ReactNode;
};

/**
 * 화면 상단 헤더. 상단에 고정한다.
 * - 위쪽은 노치(상태바) 영역만큼 띄운다. 기본 헤더는 Figma처럼 상태바와 헤더 사이를 26px 더 띄운다.
 * - 좌우 여백은 16px(뒤로가기 버튼은 누르는 영역이 넓어서 왼쪽으로 당긴다).
 * - 배경은 부모(화면) 배경을 이어받아, 스크롤할 때 뒤 내용이 비치지 않게 한다.
 */
export default function AppHeader({
  title,
  nested = false,
  centered = false,
  onBack,
  suffixAction,
}: AppHeaderProps) {
  const router = useRouter();

  // 딥링크로 바로 들어와 앱 안 기록이 없으면 홈으로 보낸다.
  const handleBack = onBack ?? (() => (canGoBackInApp() ? router.back() : router.replace("/")));

  if (centered) {
    return (
      <header className="border-line sticky top-0 z-10 border-b bg-inherit pt-[env(safe-area-inset-top)]">
        <div className="relative flex h-14 items-center justify-center px-4">
          {nested && (
            <IconButton
              aria-label="뒤로 가기"
              onClick={handleBack}
              className="absolute top-1.5 left-4 size-11"
            >
              <ChevronLeft aria-hidden />
            </IconButton>
          )}
          <h1 className="text-title-1 font-title text-fg-primary max-w-[calc(100%-120px)] truncate">
            {title}
          </h1>
          {suffixAction && (
            <div className="absolute top-1.5 right-4 flex items-center">{suffixAction}</div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 bg-inherit px-4 pt-[calc(env(safe-area-inset-top)+26px)]">
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
