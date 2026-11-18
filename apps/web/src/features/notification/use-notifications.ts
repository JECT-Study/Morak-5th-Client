import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { NotificationPage } from "./types";

const PAGE_SIZE = 20;
const NOTIFICATIONS_KEY = ["notifications"] as const;
const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

const fetchNotifications = (before: number | null) => {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (before !== null) query.set("before", String(before));
  return request<NotificationPage>(`/api/notifications?${query}`);
};

/** 내 알림 목록(최신순, before 커서). */
export const useNotifications = () =>
  useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_KEY, "list"],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

/** 종 아이콘 확인 주기. 알림은 소켓으로 오지 않아서(채팅만 STOMP) 화면을 보는 동안 주기적으로 묻는다. */
const UNREAD_POLL_MS = 60_000;

/**
 * 읽지 않은 알림 개수. 로그인하지 않았으면 부르지 않는다(enabled).
 * 화면을 보는 동안 1분마다 다시 묻고(백그라운드 탭은 멈춤), 앱에서 푸시를 받으면 바로 다시 묻는다(AppBridgeListener).
 */
export const useUnreadNotificationCount = (enabled = true) =>
  useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () => request<{ unreadCount: number }>("/api/notifications/unread-count"),
    select: (data) => data.unreadCount,
    enabled,
    refetchInterval: UNREAD_POLL_MS,
  });

/** 읽음 처리 뒤 목록과 안 읽은 개수를 다시 불러온다. */
const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
};

export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: number) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: invalidate,
  });
};

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => request("/api/notifications/read-all", { method: "PATCH" }),
    onSuccess: invalidate,
  });
};
