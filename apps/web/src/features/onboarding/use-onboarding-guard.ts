import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { MyUserInfo } from "@/features/auth/types";

type OnboardingGuardOptions = {
  me: MyUserInfo | undefined;
  /** 내 정보를 불러오지 못함(로그인 안 됨) */
  isError: boolean;
  /** false면 검사하지 않는다. 완료 화면에서는 내 정보가 onboarded로 바뀌므로 끈다. */
  enabled: boolean;
};

/**
 * 온보딩에 들어올 수 있는 사람인지 확인하고, 아니면 알맞은 곳으로 보낸다.
 * - 로그인 안 됨 → 로그인
 * - 이미 온보딩 완료 → 홈
 * - 약관 동의 전 → 로그인 화면의 약관 시트
 */
export function useOnboardingGuard({ me, isError, enabled }: OnboardingGuardOptions) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    if (isError) router.replace("/login");
    else if (me?.onboarded) router.replace("/");
    else if (me && !me.termsAgreed) router.replace("/login?step=terms");
  }, [me, isError, enabled, router]);
}
