import { useInfiniteQuery } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { ChallengePage, RecruitingFilter } from "./recruiting-types";

const PAGE_SIZE = 20;

const fetchRecruitingChallenges = (filter: RecruitingFilter, cursor: number | null) => {
  const query = new URLSearchParams({ size: String(PAGE_SIZE) });
  if (filter.category) query.set("category", filter.category);
  if (filter.keyword) query.set("keyword", filter.keyword);
  if (cursor !== null) query.set("cursor", String(cursor));
  return request<ChallengePage>(`/api/challenges?${query}`);
};

/** 모집 중인 공개 챌린지 목록(커서 페이지). 검색 조건이 바뀌면 처음부터 다시 불러온다. */
export const useRecruitingChallenges = (filter: RecruitingFilter) =>
  useInfiniteQuery({
    queryKey: ["challenges", "recruiting", filter],
    queryFn: ({ pageParam }) => fetchRecruitingChallenges(filter, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
  });
