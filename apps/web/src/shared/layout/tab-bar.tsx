"use client";

import { House, MessageSquareMore, Search, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import { useHaptic } from "@/shared/native/use-haptic";

// Figma "내비게이션 페이지별 탭" 순서
const TABS = [
  { href: "/", label: "내 챌린지", icon: House },
  { href: "/challenges", label: "모집 중", icon: Search },
  { href: "/chats", label: "채팅", icon: MessageSquareMore },
  { href: "/my", label: "마이페이지", icon: UserRound },
] as const satisfies readonly { href: string; label: string; icon: LucideIcon }[];

/** 하단 탭바. 높이는 84px + 하단 안전 영역이고, 탭 레이아웃이 그만큼 아래 여백을 둔다. */
export default function TabBar() {
  const pathname = usePathname();
  const haptic = useHaptic();

  return (
    <nav aria-label="주요 메뉴" className="max-w-app fixed inset-x-0 bottom-0 z-10 mx-auto">
      <ul className="rounded-16 border-line-subtle bg-surface-primary shadow-float-nav flex gap-3 border p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {TABS.map(({ href, label, icon: TabIcon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                // 다른 탭으로 옮길 때만 가볍게 진동한다(앱 네이티브 햅틱, 브라우저는 지원할 때만).
                onClick={active ? undefined : () => haptic("light")}
                className={cn(
                  "rounded-12 text-label-xs flex flex-col items-center gap-0.5 px-2 py-1",
                  "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "bg-surface-brand-subtle font-label-strong text-fg-brand-strong"
                    : "font-label-normal text-fg-quaternary",
                )}
              >
                <TabIcon aria-hidden className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
