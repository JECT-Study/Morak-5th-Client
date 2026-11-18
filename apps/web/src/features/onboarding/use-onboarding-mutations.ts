import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { checkNickname, completeOnboarding } from "@/features/auth/onboarding-api";
import { ApiError } from "@/shared/api/client";

export const NICKNAME_TAKEN = "이미 사용 중인 닉네임이에요.";

/** 닉네임 사용 가능 여부 확인. 결과({ available })는 mutate 옵션의 onSuccess에서 받는다. */
export function useCheckNickname() {
  return useMutation({ mutationFn: checkNickname });
}

type CompleteOnboardingOptions = {
  /** 저장 직전에 다른 사람이 같은 닉네임을 쓴 경우(USER_004) */
  onNicknameTaken: () => void;
};

/**
 * 온보딩 완료 저장. 성공하면 내 정보 캐시를 갱신한다.
 * 이미 완료(USER_003)면 홈으로, 약관 동의 전(USER_002)이면 약관 시트로 보낸다.
 */
export function useCompleteOnboarding({ onNicknameTaken }: CompleteOnboardingOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (updated) => queryClient.setQueryData(["users", "me"], updated),
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : null;
      if (code === "USER_004") onNicknameTaken();
      else if (code === "USER_003") router.replace("/");
      else if (code === "USER_002") router.replace("/login?step=terms");
    },
  });

  const code = mutation.error instanceof ApiError ? mutation.error.code : null;
  const handled = code === "USER_002" || code === "USER_003" || code === "USER_004";

  return {
    complete: mutation.mutate,
    isPending: mutation.isPending,
    /** 이 화면에서 온보딩 저장을 마쳤는지. 마친 뒤에는 내 정보가 onboarded로 바뀌어도 홈으로 보내지 않는다. */
    isCompleted: mutation.isSuccess,
    /** 따로 처리하지 않은 실패만 화면에 보여준다. */
    errorMessage: mutation.isError && !handled ? "저장하지 못했어요. 다시 시도해 주세요." : null,
  };
}
