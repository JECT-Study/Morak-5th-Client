"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import { useHaptic } from "@/shared/native/use-haptic";

// Figma 컴포넌트 "bottom nevibar" 순서. 아이콘은 Figma "icon nevi"(vuesax bold)의 비활성·활성 그림이다.
// TODO: 채팅 탭의 새 메시지 점은 읽지 않은 수 API가 생기면 붙인다.
const TABS = [
  { href: "/", label: "내 챌린지", icon: "home" },
  { href: "/challenges", label: "모집 중", icon: "flag" },
  { href: "/chats", label: "채팅", icon: "message" },
  { href: "/shop", label: "상점", icon: "shop" },
  { href: "/my", label: "마이페이지", icon: "profile" },
] as const;

/** 탭 주소(왼쪽부터). 탭을 옮길 때 화면이 들어오는 방향을 정하는 데도 쓴다. */
export const TAB_HREFS: readonly string[] = TABS.map(({ href }) => href);

/**
 * 하단 탭바(Figma "bottom nevibar"). 흰 바탕 + 위쪽 옅은 구분선, 탭 높이 70px + 하단 안전 영역.
 * 탭 레이아웃이 그만큼 아래 여백을 둔다. 지금 탭은 아이콘·글자가 진하고(#2f3036), 나머지는 옅다.
 */
export default function TabBar() {
  const pathname = usePathname();
  const haptic = useHaptic();

  return (
    <nav
      aria-label="주요 메뉴"
      className="max-w-app border-surface-secondary bg-background-primary fixed inset-x-0 bottom-0 z-10 mx-auto border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {TABS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                // 다른 탭으로 옮길 때만 가볍게 진동한다(앱 네이티브 햅틱, 브라우저는 지원할 때만).
                onClick={active ? undefined : () => haptic("light")}
                className={cn(
                  "text-label-xs font-body-normal flex h-[70px] flex-col items-center justify-center gap-1 leading-[1.3]",
                  "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                  active ? "text-fg-neutral" : "text-fg-secondary",
                )}
              >
                <Image
                  src={`/icons/nav/${icon}-${active ? "active" : "inactive"}.svg`}
                  alt=""
                  width={24}
                  height={24}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
