"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";
import { Separator } from "@/shared/ui/separator";
import { Switch } from "@/shared/ui/switch";
import { Skeleton } from "@/shared/ui/skeleton";

import { useLogout, useMarketingAgreement } from "../use-account";

const ROW =
  "flex min-h-14 w-full items-center justify-between gap-3 px-4 text-body-lg font-body-normal text-fg-primary";

/**
 * 설정 화면 목록. 시안이 없어 위키 6.10 순서(위: 알림, 아래: 로그아웃·회원 탈퇴)로 임시 구성했다.
 * TODO: 이용약관·개인정보처리방침 문서 주소와 알림 설정 범위가 정해지면 위쪽에 추가한다.
 *       알림 설정 범위가 정해지기 전에는 "전체 알림 끄기"를 만들지 않는다(위키 6.10).
 */
export default function SettingsMenu() {
  const marketingId = useId();
  const { data: me, isPending: isMeLoading } = useMyInfo();
  const marketing = useMarketingAgreement();
  const { logout, isPending: isLoggingOut, errorMessage: logoutError } = useLogout();

  return (
    <main className="flex flex-1 flex-col py-2">
      <section aria-label="알림">
        <div className={ROW}>
          <label htmlFor={marketingId} className="flex-1">
            이벤트·혜택 알림 받기
          </label>
          {isMeLoading ? (
            <Skeleton className="rounded-max h-6 w-10" />
          ) : (
            <Switch
              id={marketingId}
              checked={me?.marketingAgreed ?? false}
              disabled={!me || marketing.isPending}
              onCheckedChange={(checked) => marketing.update(checked)}
            />
          )}
        </div>
        {marketing.errorMessage && (
          <p role="alert" className="text-label-sm text-danger px-4 pb-2">
            {marketing.errorMessage}
          </p>
        )}
      </section>

      <Separator className="my-2" />

      <section aria-label="계정">
        <button type="button" className={ROW} onClick={logout} disabled={isLoggingOut}>
          로그아웃
        </button>
        {logoutError && (
          <p role="alert" className="text-label-sm text-danger px-4 pb-2">
            {logoutError}
          </p>
        )}
        <Link href="/settings/withdrawal" className={`${ROW} text-fg-tertiary`}>
          회원 탈퇴
          <ChevronRight aria-hidden className="text-fg-quaternary size-5" />
        </Link>
      </section>
    </main>
  );
}
