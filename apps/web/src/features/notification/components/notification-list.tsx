"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";

import { formatNotificationTime, toNotificationPath } from "../notification-link";
import type { AppNotification } from "../types";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../use-notifications";

/**
 * 앱 안 알림함(위키 8절). 최신순, 안 읽은 알림은 점과 옅은 배경으로 표시한다.
 * 누르면 읽음 처리하고 대상 화면으로 이동한다. 삭제는 없다(FE-O15 기본값).
 * TODO: 알림 목록 시안이 나오면 맞춘다([디자인 필요]).
 */
export default function NotificationList() {
  const router = useRouter();
  const {
    data,
    error,
    isPending,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="알림을 불러오는 중" className="flex flex-col gap-2 p-4">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="rounded-12 h-20" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16">
        <p className="text-body-md font-body-normal text-fg-tertiary">정보를 불러오지 못했어요.</p>
        <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
          다시 시도
        </Button>
      </div>
    );
  }

  const notifications = data.pages.flatMap((page) => page.notifications);
  if (notifications.length === 0) {
    return (
      <p className="text-body-md font-body-normal text-fg-tertiary px-4 py-16 text-center">
        아직 받은 알림이 없어요.
      </p>
    );
  }

  const hasUnread = notifications.some((notification) => !notification.read);

  const open = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    const path = toNotificationPath(notification);
    if (path) router.push(path);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-end px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          모두 읽음
        </Button>
      </div>
      <ul className="flex flex-col">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => open(notification)}
              className={cn(
                "border-line-subtle flex w-full items-start gap-3 border-b px-4 py-4 text-left",
                "hover:bg-surface-secondary active:bg-surface-secondary-pressed",
                !notification.read && "bg-surface-brand-subtle/40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  notification.read ? "bg-transparent" : "bg-surface-brand",
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-label-md font-label-strong text-fg-primary truncate">
                    {!notification.read && <span className="sr-only">읽지 않음, </span>}
                    {notification.title}
                  </span>
                  <span className="text-label-xs text-fg-tertiary shrink-0">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </span>
                <span className="text-body-sm font-body-normal text-fg-secondary break-keep">
                  {notification.body}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Spinner size={20} /> : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  );
}
