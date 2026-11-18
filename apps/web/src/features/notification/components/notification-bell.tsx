"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import { useMyInfo } from "@/features/auth/use-my-info";
import { IconButton } from "@/shared/ui/icon-button";

import { useUnreadNotificationCount } from "../use-notifications";

/** 홈 우측 상단 종 아이콘. 안 읽은 알림이 있을 때만 점을 보인다(위키 5.1, 8절). */
export default function NotificationBell() {
  const { data: me } = useMyInfo();
  const { data: unreadCount = 0 } = useUnreadNotificationCount(!!me);
  const hasUnread = unreadCount > 0;

  return (
    <span className="relative flex">
      <IconButton asChild aria-label={hasUnread ? "알림, 새 알림 있음" : "알림"}>
        <Link href="/notifications">
          <Bell aria-hidden />
        </Link>
      </IconButton>
      {hasUnread && (
        <span
          aria-hidden
          className="bg-surface-brand rounded-max pointer-events-none absolute top-2 right-2 size-2"
        />
      )}
    </span>
  );
}
