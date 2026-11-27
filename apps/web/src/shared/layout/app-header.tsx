"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { canGoBackInApp } from "@/shared/navigation/history";
import { IconButton } from "@/shared/ui/icon-button";

type AppHeaderProps = {
  title: string;
  /** 하위 화면이면 왼쪽에 뒤로가기 버튼을 보인다. */
  nested?: boolean;
  /**
   * 탭 화면이 아닌데 뒤로가기가 없는 화면(온보딩 첫 단계 등)도 제목을 가운데에 둔다.
   * nested면 자동으로 가운데 제목이라 따로 주지 않아도 된다.
   */
  centered?: boolean;
  /** 뒤로가기를 직접 처리할 때(예: 온보딩 단계 되돌리기). 없으면 브라우저 뒤로가기 */
  onBack?: () => void;
  /** 뒤로가기를 누르면 항상 이 주소로 보낼 때(서버 컴포넌트에서 onBack 대신). 예) 챌린지 상세 → 목록 */
  backHref?: string;
  /** 오른쪽 아이콘 버튼. 한 칸은 48×48(Figma icon 슬롯)이다. */
  suffixAction?: ReactNode;
};

/** 오른쪽 아이콘 칸. 아이콘 버튼을 Figma 슬롯 크기(48×48, 아이콘 24)로 맞춘다. */
const ACTIONS_CLASS = "flex shrink-0 items-center [&_[data-slot=icon-button]]:size-12";

/**
 * 화면 상단 헤더(Figma "Header"). 상단에 고정하고, 배경은 화면 배경을 이어받는다.
 * - 탭 화면(Type=Logo·Recruiting·Chat·Mypage·Shop): 왼쪽 큰 제목(22px Bold) + 오른쪽 아이콘 칸.
 *   상태바와 헤더 사이를 26px 더 띄운다.
 * - 하위 화면(Type=Default): 왼쪽 뒤로가기(arrow-left) · 가운데 제목(18px Bold) · 오른쪽 칸. 높이 48.
 *   제목이 정확히 가운데 오도록 좌우 칸을 같은 너비(48)로 둔다.
 */
export default function AppHeader({
  title,
  nested = false,
  centered = false,
  onBack,
  backHref,
  suffixAction,
}: AppHeaderProps) {
  const router = useRouter();

  // 딥링크로 바로 들어와 앱 안 기록이 없으면 홈으로 보낸다.
  const handleBack =
    onBack ??
    (() => {
      if (backHref) router.replace(backHref);
      else if (canGoBackInApp()) router.back();
      else router.replace("/");
    });

  if (nested || centered) {
    return (
      <header className="sticky top-0 z-10 bg-inherit pt-[env(safe-area-inset-top)]">
        <div className="grid h-12 grid-cols-[3rem_minmax(0,1fr)_3rem] items-center">
          <div className="flex items-center">
            {nested && (
              <IconButton aria-label="뒤로 가기" size="lg" onClick={handleBack}>
                <ArrowLeft aria-hidden />
              </IconButton>
            )}
          </div>
          <h1 className="text-title-1 font-title text-fg-primary truncate text-center">{title}</h1>
          <div className={`${ACTIONS_CLASS} justify-end`}>{suffixAction}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 bg-inherit pt-[calc(env(safe-area-inset-top)+26px)]">
      <div className="flex h-12 items-center pl-4">
        <h1 className="text-heading font-title text-fg-primary min-w-0 flex-1 truncate">{title}</h1>
        {suffixAction && <div className={ACTIONS_CLASS}>{suffixAction}</div>}
      </div>
    </header>
  );
}
