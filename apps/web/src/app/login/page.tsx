import { BlockButton } from "@jects/jds";
import Image from "next/image";
import Link from "next/link";

import SocialLoginButton from "@/features/auth/components/social-login-button";
import { Suspense } from "react";
import LoginError from "@/features/auth/components/login-error";
import TermsSheet from "@/features/auth/components/terms-sheet";

async function TermsStep({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { step } = await searchParams;
  return step === "terms" ? <TermsSheet /> : null;
}

/** 로그인(Figma "로그인"). 헤더 없이 상태바 아래 48px부터 시작하고, 버튼 묶음은 아래쪽에 붙인다. */
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 pt-[calc(env(safe-area-inset-top)+48px)] pb-[calc(env(safe-area-inset-bottom)+24px)] text-center">
      <Image src="/images/morak-character.svg" alt="" width={128} height={123} priority />
      <h1 className="text-title-3 font-title-normal text-object-boldest">
        함께하니까, 포기하지 않게
      </h1>
      <p className="text-body-md font-body-normal text-object-neutral break-keep">
        목표를 함께하고, 보증금으로 실천 의지를 더해
        <br />
        끝까지 완주해 보세요.
      </p>

      <div className="flex-1" />

      <div className="flex w-full flex-col gap-2">
        <Suspense>
          <LoginError searchParams={searchParams} />
        </Suspense>
        <SocialLoginButton provider="kakao" />
        {/* TODO: 백엔드가 구글 로그인을 지원하면 활성화한다. */}
        <SocialLoginButton provider="google" disabled />
        <BlockButton asChild size="md" variant="hollow" suffixIcon="chevron-right">
          <Link href="/">로그인 없이 둘러보기</Link>
        </BlockButton>
      </div>

      <p className="text-label-sm font-label-subtle text-object-alternative">
        처음이면 가입 후 간단한 설정으로 이어져요.
        <br />
        계속하면 이용약관 및 개인정보처리방침에 동의하게 됩니다.
      </p>

      {/* 가입 후 약관 동의 전이면 온보딩이 /login?step=terms로 보낸다. */}
      <Suspense>
        <TermsStep searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
