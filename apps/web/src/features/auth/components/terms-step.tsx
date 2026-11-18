"use client";

import { useSearchParams } from "next/navigation";

import TermsSheet from "./terms-sheet";

/**
 * 주소가 /login?step=terms면 약관 시트를 띄운다(가입 후 약관 동의 전).
 * 서버에서 searchParams로 고르면, 로그인 직후처럼 페이지를 새로 열 때 시트가 그려지지 않는 경우가 있어
 * 브라우저에서 주소를 읽어 고른다. useSearchParams를 쓰므로 Suspense 안에 둔다.
 */
export default function TermsStep() {
  const step = useSearchParams().get("step");
  return step === "terms" ? <TermsSheet /> : null;
}
