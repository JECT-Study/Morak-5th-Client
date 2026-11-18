import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/client";

import { agreeToTerms } from "./onboarding-api";

/** 이미 필수 약관에 동의한 계정 (다른 탭에서 먼저 동의한 경우 등) */
const isAlreadyAgreed = (error: unknown) => error instanceof ApiError && error.code === "USER_001";

/**
 * 최초 약관 동의를 저장하고 온보딩으로 보낸다.
 * 이미 동의한 계정이면 에러로 보지 않고 그대로 온보딩으로 넘어간다.
 */
export function useAgreeTerms() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 로그인 화면에는 내 정보를 보는 곳이 없어 invalidate만 하면 다시 불러오지 않는다.
  // 그러면 온보딩이 옛 값(약관 미동의)을 보고 약관 시트로 되돌려 보내므로, 새 값을 받은 뒤 이동한다.
  const goToOnboarding = async () => {
    await queryClient.refetchQueries({ queryKey: ["users", "me"] });
    router.replace("/onboarding");
  };

  const mutation = useMutation({
    mutationFn: agreeToTerms,
    onSuccess: goToOnboarding,
    onError: async (error) => {
      if (isAlreadyAgreed(error)) await goToOnboarding();
    },
  });

  return {
    agree: mutation.mutate,
    // 성공 후 온보딩으로 이동하는 동안에도 버튼을 다시 켜지 않는다.
    isPending: mutation.isPending || mutation.isSuccess,
    errorMessage:
      mutation.isError && !isAlreadyAgreed(mutation.error)
        ? "동의를 저장하지 못했어요. 다시 시도해 주세요."
        : null,
  };
}
