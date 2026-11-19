"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMyInfo } from "../use-my-info";

/** 온보딩 전에도 머무를 수 있는 경로. 로그인·약관·온보딩 화면 자체와 개발용 화면이다. */
const ALLOWED_PREFIXES = ["/login", "/onboarding", "/dev"];

/**
 * 로그인했지만 온보딩을 마치지 않은 계정을 온보딩으로 보낸다(위키 9절).
 * 백엔드는 온보딩 전 계정의 대부분 API를 403(AUTH_005)으로 막아, 그대로 두면 화면마다 오류가 뜬다.
 * - 약관 동의 전 → 로그인 화면의 약관 시트, 동의 후 → 온보딩
 * - 로그인하지 않았으면(내 정보 없음) 아무것도 하지 않는다. 둘러보기는 그대로 된다.
 */
export default function OnboardingRedirect() {
  const pathname = usePathname();
  const allowed = ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  return allowed ? null : <RedirectWhenNotOnboarded />;
}

function RedirectWhenNotOnboarded() {
  const router = useRouter();
  const { data: me } = useMyInfo();

  useEffect(() => {
    if (!me || me.onboarded) return;
    router.replace(me.termsAgreed ? "/onboarding" : "/login?step=terms");
  }, [me, router]);

  return null;
}
