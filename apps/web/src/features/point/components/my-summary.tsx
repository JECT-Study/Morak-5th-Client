"use client";

import { ChevronRight, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useMyInfo } from "@/features/auth/use-my-info";
import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { formatPoint } from "../format";
import { usePointLedger } from "../use-point-ledger";

/**
 * 마이페이지 본문(위키 6.2). 시안이 없어 지금 API로 보여 줄 수 있는 것만 임시로 구성했다.
 * 프로필(사진·닉네임) → 사용 가능한 포인트 + 포인트 내역.
 * TODO: 한 줄 소개·링크·관심 분야, 모락이·인증률, 완주·중도 실패 횟수, 메달,
 *       종료된 챌린지 전체 보기, 승인 대기 목록은 API가 나오면 이 순서대로 추가한다.
 */
export default function MySummary() {
  const { data: me, error, isPending, refetch, isRefetching } = useMyInfo();

  if (isPending) {
    return (
      <main aria-busy="true" aria-label="내 정보를 불러오는 중" className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="rounded-12 h-20" />
      </main>
    );
  }

  if (error) {
    // TODO: 비로그인 마이페이지(FE-O2)가 정해지면 맞춘다.
    const unauthenticated = error instanceof ApiError && error.status === 401;
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-body-md font-body-normal text-fg-tertiary">
          {unauthenticated ? "로그인하고 내 정보를 확인해 보세요." : "정보를 불러오지 못했어요."}
        </p>
        {unauthenticated ? (
          <Button asChild variant="outline" size="md">
            <Link href="/login">로그인하기</Link>
          </Button>
        ) : (
          <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
            다시 시도
          </Button>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <section aria-label="프로필" className="flex items-center gap-3">
        <span className="bg-surface-tertiary text-fg-quaternary relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {me.profileImageUrl ? (
            // TODO: 이미지 저장소 도메인이 정해지면 next.config의 images.remotePatterns에 등록하고 최적화를 켠다.
            <Image
              src={me.profileImageUrl}
              alt=""
              fill
              sizes="64px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <UserRound aria-hidden className="size-8" />
          )}
        </span>
        <p className="text-title-2 font-title text-fg-primary min-w-0 truncate">{me.nickname}</p>
      </section>

      <PointSummary />
    </main>
  );
}

/** 사용 가능한 포인트(서버 잔액 그대로, 위키 3.4) + 포인트 내역 진입. 본인 화면에서만 쓴다. */
function PointSummary() {
  const { data, isPending, isError } = usePointLedger();

  return (
    <Link
      href="/my/points"
      className="bg-surface-primary rounded-12 focus-visible:ring-line-focus flex items-center justify-between gap-3 p-4 focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="flex flex-col gap-1">
        <span className="text-label-md font-label-normal text-fg-tertiary">사용 가능한 포인트</span>
        {isPending ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <span className="text-title-2 font-title text-fg-primary">
            {/* 불러오지 못했으면 0P로 보이지 않게 대시를 쓴다(위키 3.2). */}
            {isError ? "-" : formatPoint(data.pages[0].balance)}
          </span>
        )}
      </span>
      <span className="text-label-md font-label-normal text-fg-secondary flex items-center gap-0.5">
        포인트 내역
        <ChevronRight aria-hidden className="size-4" />
      </span>
    </Link>
  );
}
