"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { ApiError } from "@/shared/api/client";
import { isProtectedPath } from "@/shared/navigation/protected-paths";

import { useMyInfo } from "../use-my-info";

/**
 * 로그인이 필요한 화면에 로그인하지 않은 채 들어오면 로그인 화면으로 보낸다.
 * 페이지 요청은 proxy가 막지만, 링크 미리 불러오기(prefetch)로 받아 둔 화면은 proxy를 거치지 않고 열려서
 * 여기서 한 번 더 확인한다. 내 정보 조회가 401이면(재발급도 실패) 로그인하지 않은 것이다.
 */
export default function LoginRedirect() {
  const pathname = usePathname();
  return isProtectedPath(pathname) ? <RedirectWhenLoggedOut /> : null;
}

function RedirectWhenLoggedOut() {
  const router = useRouter();
  const { error } = useMyInfo();
  const loggedOut = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (loggedOut) router.replace("/login");
  }, [loggedOut, router]);

  return null;
}
