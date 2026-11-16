import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/client";

import { createChallenge, toCreateChallengeRequest } from "./challenge-api";
import type { ChallengeCreateForm } from "./create-schema";

const FALLBACK_MESSAGE = "챌린지를 만들지 못했어요. 다시 시도해 주세요.";

/**
 * 챌린지 개설. 성공하면 만든 챌린지 상세로 이동한다.
 * - 401(로그인 만료)은 로그인, 403(온보딩 전)은 온보딩 화면으로 보낸다.
 * - 400·409는 서버 문구를 그대로 보여준다. 400 규칙은 폼 검증(zod)이 먼저 막으므로
 *   자정이 지나는 등 드문 경우에만 온다.
 * TODO: 409(동시 참여 한도·포인트 처리) 모달 시안이 나오면 모달로 바꾼다.
 */
export const useCreateChallenge = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (values: ChallengeCreateForm) => createChallenge(toCreateChallengeRequest(values)),
    onSuccess: ({ challengeId }) => router.push(`/challenges/${challengeId}`),
    onError: (cause) => {
      if (!(cause instanceof ApiError)) return;
      if (cause.status === 401) router.replace("/login");
      else if (cause.status === 403) router.replace("/onboarding");
    },
  });

  return { ...mutation, errorMessage: toErrorMessage(mutation.error) };
};

/** 버튼 위에 보여줄 실패 문구. 실패가 없으면 null */
const toErrorMessage = (error: Error | null): string | null => {
  if (!error) return null;
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) {
    return error.message;
  }
  return FALLBACK_MESSAGE;
};
