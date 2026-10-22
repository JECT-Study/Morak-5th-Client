"use client";

import { Icon, type IconName } from "@jects/jds";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Figma "내비게이션 페이지별 탭" 순서
const TABS = [
  { href: "/", label: "내 챌린지", icon: "house" },
  { href: "/challenges", label: "모집 중", icon: "search" },
  { href: "/chats", label: "채팅", icon: "message-square-more" },
  { href: "/my", label: "마이페이지", icon: "user-round" },
] as const satisfies readonly { href: string; label: string; icon: IconName }[];

/** 하단 탭바. 높이는 84px + 하단 안전 영역이고, 탭 레이아웃이 그만큼 아래 여백을 둔다. */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="max-w-app fixed inset-x-0 bottom-0 z-10 mx-auto">
      <ul className="rounded-16 border-stroke-subtler bg-surface-standard flex gap-3 border p-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_1px_6px_rgb(38_49_59/0.03)]">
        {TABS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-12 flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] leading-4 ${
                  active
                    ? "bg-(--color-semantic-feedback-positive-alpha-inverse-subtlest) font-[520] text-(--color-semantic-feedback-positive-inverse-neutral)"
                    : "text-object-alternative font-[440]"
                }`}
              >
                <Icon name={icon} size="xl" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
