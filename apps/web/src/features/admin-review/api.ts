import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { ApiError, request } from "@/shared/api/client";

import type { ReviewChallengeOption, ReviewDetail, ReviewListFilters, ReviewPage } from "./types";

/**
 * 운영진 인증 검수 API(위키 §4.10, D-31). 브라우저는 BFF(`/api/admin/*`)만 부르고,
 * BFF가 쿠키의 토큰을 Spring `/admin/**`로 전달한다. ADMIN이 아니면 403이다.
 * TODO: OpenAPI가 배포되면 Orval 생성 코드로 바꾼다.
 */
const BASE = "/api/admin/certification-reviews";

export const reviewKeys = {
  all: ["admin-review"] as const,
  list: (filters: ReviewListFilters) => [...reviewKeys.all, "list", filters] as const,
  challenges: () => [...reviewKeys.all, "challenges"] as const,
  detail: (id: number) => [...reviewKeys.all, "detail", id] as const,
};

export const useReviewList = (filters: ReviewListFilters) =>
  useQuery({
    queryKey: reviewKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams({ status: filters.status });
      if (filters.certDate) params.set("certDate", filters.certDate);
      if (filters.challengeId) params.set("challengeId", String(filters.challengeId));
      return request<ReviewPage>(`${BASE}?${params}`);
    },
    placeholderData: keepPreviousData,
    // 여러 운영진이 동시에 검수하므로 목록은 매번 새로 받는다.
    staleTime: 0,
  });

export const useReviewChallenges = () =>
  useQuery({
    queryKey: reviewKeys.challenges(),
    queryFn: () => request<ReviewChallengeOption[]>(`${BASE}/challenges`),
  });

export const useReviewDetail = (id: number) =>
  useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => request<ReviewDetail>(`${BASE}/${id}`),
    staleTime: 0,
  });

/** 판정(승인·거절) 공통 처리. 결과·충돌 모두 다른 운영진 화면과 어긋날 수 있어 목록과 상세를 다시 받는다. */
const useJudge = <V>(id: number, call: (variables: V) => Promise<ReviewDetail>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: call,
    onSuccess: (detail) => {
      queryClient.setQueryData(reviewKeys.detail(id), detail);
      void queryClient.invalidateQueries({ queryKey: [...reviewKeys.all, "list"] });
    },
    onError: (error) => {
      // 이미 처리된 경우(409)는 최신 결과를 보여줘야 한다. 그 밖의 실패는 상태를 알 수 없으니 재조회로 확인한다.
      void queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) });
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: [...reviewKeys.all, "list"] });
      }
    },
  });
};

export const useApproveReview = (id: number) =>
  useJudge<void>(id, () => request<ReviewDetail>(`${BASE}/${id}/approve`, { method: "POST" }));

export const useRejectReview = (id: number) =>
  useJudge<string>(id, (reason) =>
    request<ReviewDetail>(`${BASE}/${id}/reject`, { method: "POST", json: { reason } }),
  );

/** 판정 실패가 "이미 다른 운영진이 처리함"(409)인지 */
export const isAlreadyJudged = (error: unknown) =>
  error instanceof ApiError && error.status === 409;

/** 운영진이 아니거나(403) 로그인이 필요한(401) 경우 */
export const isAccessError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);
