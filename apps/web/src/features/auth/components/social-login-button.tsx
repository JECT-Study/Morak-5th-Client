"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";

import { Spinner } from "@/shared/ui/spinner";

import { GoogleLogo, KakaoLogo } from "./social-logos";

type SocialLoginButtonProps = {
  provider: "kakao" | "google";
  /** 백엔드가 아직 지원하지 않는 제공자는 비활성으로 보여준다. */
  disabled?: boolean;
};

const PROVIDER_STYLES: Record<
  SocialLoginButtonProps["provider"],
  { label: string; Logo: ComponentType<SVGProps<SVGSVGElement>>; background: string }
> = {
  // 카카오 로그인 버튼 배경은 카카오 디자인 가이드의 브랜드 색(#FEE500)을 쓴다.
  kakao: { label: "카카오로 시작하기", Logo: KakaoLogo, background: "bg-[#fee500]" },
  google: {
    label: "구글로 시작하기",
    Logo: GoogleLogo,
    background: "bg-static-white",
  },
};

/**
 * 소셜 로그인 버튼(Figma "button · 카카오로 시작하기").
 * BFF 로그인 시작 라우트(/api/auth/[provider])로 페이지를 이동시켜야 해서 next/link가 아닌 <a>를 쓴다.
 * (Link는 미리 불러오기로 라우트를 호출해 state 쿠키를 덮어쓸 수 있다.)
 * 호버·누름 오버레이는 JDS Interaction layer(fill-inverse-boldest, 8%·12%)와 같다.
 *
 * 누르면 로그인이 끝날 때까지 "로그인하는 중이에요"와 스피너를 보인다. 카카오에 이미 로그인돼 있으면
 * 카카오 화면 없이 바로 돌아와 서버 로그인을 기다리는데, 그동안 이 화면이 그대로 남아 있어서다.
 */
export default function SocialLoginButton({ provider, disabled = false }: SocialLoginButtonProps) {
  const { label, Logo, background } = PROVIDER_STYLES[provider];
  const [pending, setPending] = useState(false);

  // 뒤로가기로 이 화면이 캐시에서 다시 보이면(bfcache) 로딩 상태를 푼다.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  const className = `${background} rounded-8 text-label-lg font-label-strong text-fg-primary relative flex h-[42px] w-full items-center justify-center gap-1 overflow-hidden px-5 after:pointer-events-none after:absolute after:inset-0 after:bg-static-black after:opacity-0 after:transition-opacity after:duration-150 transition-[scale] duration-150 motion-safe:active:scale-98 hover:after:opacity-8 active:after:opacity-12 disabled:cursor-not-allowed disabled:opacity-40 disabled:after:hidden`;
  const content = (
    <>
      <Logo className="text-base" />
      {label}
    </>
  );

  if (disabled) {
    return (
      <button type="button" disabled className={className}>
        {content}
      </button>
    );
  }
  return (
    <a
      href={`/api/auth/${provider}`}
      aria-busy={pending}
      // 로그인 중에는 다시 눌러 요청이 겹치지 않게 막는다.
      aria-disabled={pending}
      onClick={(event) => {
        if (pending) event.preventDefault();
        else setPending(true);
      }}
      className={`${className} ${pending ? "pointer-events-none" : ""}`}
    >
      {pending ? (
        <>
          <Spinner size={20} label="로그인하는 중" />
          로그인하는 중이에요
        </>
      ) : (
        content
      )}
    </a>
  );
}
