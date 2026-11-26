import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/shared/api/client";
import { compressImage } from "@/shared/lib/compress-image";

import type { CertificationFeed, CertificationLike, SubmittedCertification } from "./types";

const feedKey = (challengeId: string, date: string) =>
  ["challenges", challengeId, "certifications", date] as const;

/** 한 날짜의 팀 인증 피드. 사진 주소가 300초짜리라 4분이 지나면 새로 받는다. */
export const useCertificationFeed = (challengeId: string, date: string) =>
  useQuery({
    queryKey: feedKey(challengeId, date),
    queryFn: () =>
      request<CertificationFeed>(
        `/api/challenges/${encodeURIComponent(challengeId)}/certifications?${new URLSearchParams({ date })}`,
      ),
    staleTime: 4 * 60 * 1000,
  });

/**
 * 오늘 인증 제출(위키 5.9). 사진을 줄여서 보낸다. certDate는 화면을 연 날짜(누른 날)다.
 * 성공하면 오늘 피드와 내 챌린지(홈 카드의 오늘 인증 상태)를 다시 불러온다.
 */
export function useSubmitCertification(challengeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ image, certDate }: { image: File; certDate: string }) => {
      const formData = new FormData();
      formData.append("image", await compressImage(image));
      return request<SubmittedCertification>(
        `/api/challenges/${encodeURIComponent(challengeId)}/certifications?${new URLSearchParams({ certDate })}`,
        { method: "POST", formData },
      );
    },
    onSuccess: (_, { certDate }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: feedKey(challengeId, certDate) }),
        queryClient.invalidateQueries({ queryKey: ["users", "me", "participations"] }),
      ]),
  });
}

/**
 * 인증 좋아요 누름·취소. 누르는 즉시 피드에 반영하고, 응답(처리 뒤 상태)으로 맞춘다.
 * 실패하면(권한 없음·승인 취소 등) 원래대로 되돌리고 피드를 다시 받는다.
 */
export function useToggleLike(challengeId: string, date: string) {
  const queryClient = useQueryClient();
  const key = feedKey(challengeId, date);

  const patch = (certificationId: number, next: Pick<CertificationLike, "liked" | "likeCount">) =>
    queryClient.setQueryData<CertificationFeed>(
      key,
      (feed) =>
        feed && {
          ...feed,
          items: feed.items.map((item) =>
            item.certificationId === certificationId ? { ...item, ...next } : item,
          ),
        },
    );

  return useMutation({
    mutationFn: ({ certificationId, like }: { certificationId: number; like: boolean }) =>
      request<CertificationLike>(
        `/api/challenges/${encodeURIComponent(challengeId)}/certifications/${certificationId}/like`,
        { method: like ? "PUT" : "DELETE" },
      ),
    onMutate: async ({ certificationId, like }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CertificationFeed>(key);
      const item = previous?.items.find((i) => i.certificationId === certificationId);
      if (item && item.liked !== like) {
        patch(certificationId, { liked: like, likeCount: item.likeCount + (like ? 1 : -1) });
      }
      return { previous };
    },
    onSuccess: ({ certificationId, liked, likeCount }) =>
      patch(certificationId, { liked, likeCount }),
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
