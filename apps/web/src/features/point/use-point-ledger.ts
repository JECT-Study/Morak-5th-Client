import { useInfiniteQuery } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { PointLedger } from "./types";

const PAGE_SIZE = 20;

const fetchPointLedger = (before: number | null) => {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (before !== null) query.set("before", String(before));
  return request<PointLedger>(`/api/points/me?${query}`);
};

/**
 * 내 포인트 잔액과 거래 내역(최신순, 커서 페이지).
 * 잔액은 첫 페이지 값을 쓴다(잔액과 내역은 같은 시점 기준).
 * 포인트가 바뀌는 요청(참여 신청, 개설, 시작 보류 처리)이 성공하면 직접 다시 불러오므로 5분 동안 캐시를 쓴다.
 */
export const usePointLedger = () =>
  useInfiniteQuery({
    queryKey: ["points", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: ({ pageParam }) => fetchPointLedger(pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
