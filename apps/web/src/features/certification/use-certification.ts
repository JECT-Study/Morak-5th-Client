import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/shared/api/client";
import { compressImage } from "@/shared/lib/compress-image";

import type { CertificationFeed, SubmittedCertification } from "./types";

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
