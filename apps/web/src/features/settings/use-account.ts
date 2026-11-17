import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { MyUserInfo } from "@/features/auth/types";
import { ApiError } from "@/shared/api/client";

import { logout, updateMarketingAgreement, withdraw } from "./settings-api";

/** 로그아웃·탈퇴 뒤에는 이전 계정 데이터가 남지 않게 캐시를 비우고 홈으로 간다. */
const useLeave = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    queryClient.clear();
    router.replace("/");
  };
};

/** 로그아웃. 확인 없이 바로 하고 홈으로 간다(위키 6.10). */
export function useLogout() {
  const leave = useLeave();
  const mutation = useMutation({ mutationFn: logout, onSuccess: leave });
  return {
    logout: () => mutation.mutate(),
    // 성공 후 홈으로 이동하는 동안에도 다시 누르지 못하게 한다.
    isPending: mutation.isPending || mutation.isSuccess,
    errorMessage: mutation.isError ? "로그아웃하지 못했어요. 다시 시도해 주세요." : null,
  };
}

/** 회원 탈퇴. 409(진행 중·시작 대기 챌린지 있음)는 서버 문구를 그대로 보여준다. */
export function useWithdraw() {
  const leave = useLeave();
  const mutation = useMutation({ mutationFn: withdraw, onSuccess: leave });
  const { error } = mutation;
  return {
    withdraw: () => mutation.mutate(),
    isPending: mutation.isPending || mutation.isSuccess,
    errorMessage: !error
      ? null
      : error instanceof ApiError && error.status === 409
        ? error.message
        : "탈퇴하지 못했어요. 다시 시도해 주세요.",
  };
}

/** 마케팅 수신 동의 변경. 저장에 성공한 값만 화면에 반영한다(위키 3.2). */
export function useMarketingAgreement() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (marketingAgreed: boolean) => updateMarketingAgreement({ marketingAgreed }),
    onSuccess: (_, marketingAgreed) =>
      queryClient.setQueryData<MyUserInfo>(["users", "me"], (prev) =>
        prev ? { ...prev, marketingAgreed } : prev,
      ),
  });
  return {
    update: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? "변경하지 못했어요. 다시 시도해 주세요." : null,
  };
}
