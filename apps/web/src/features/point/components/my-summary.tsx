"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { useMyInfo } from "@/features/auth/use-my-info";
import {
  MedalSection,
  ProfileHeader,
  RecordSection,
} from "@/features/profile/components/profile-sections";
import ProfilePhotoEditor from "@/features/profile/components/profile-photo-editor";
import { useFlash } from "@/features/profile/flash";
import { useUserProfile } from "@/features/profile/use-user-profile";
import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { formatPoint } from "../format";
import { usePointLedger } from "../use-point-ledger";

/**
 * 마이페이지 본문(위키 6.2, 순서 고정). 시안이 없어 위키 순서와 기존 컴포넌트로 구성했다.
 * 프로필(사진·닉네임·소개·링크·관심 분야) → 모락이·개인 인증률 → 누적 완주·중도 실패 → 메달
 * → 사용 가능한 포인트 + 포인트 내역.
 * 프로필·기록·메달은 타인 프로필과 같은 API(GET /users/{userId})를 내 userId로 부른다.
 * → 종료된 챌린지 전체 보기.
 * TODO: 메달 상세보기(메달 목록 API·시안 필요), 승인 대기 목록(대기 중 신청 목록 API 필요)은 BE가 생기면 붙인다.
 */
export default function MySummary() {
  const { data: me, error: meError, refetch: refetchMe } = useMyInfo();
  const { data: profile, error: profileError, refetch, isRefetching } = useUserProfile(me?.userId);
  const error = meError ?? profileError;
  const flash = useFlash();

  if (!error && !profile) {
    return <MySummarySkeleton />;
  }

  if (error || !profile) {
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
          <Button
            variant="outline"
            size="md"
            onClick={() => (meError ? refetchMe() : refetch())}
            disabled={isRefetching}
          >
            다시 시도
          </Button>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-4">
      {flash && (
        <p
          role="status"
          className="bg-surface-info-subtle text-fg-info text-label-md font-label-normal rounded-12 px-4 py-3"
        >
          {flash}
        </p>
      )}
      <ProfileHeader
        profile={profile}
        avatar={<ProfilePhotoEditor userId={profile.userId} imageUrl={profile.profileImageUrl} />}
        action={
          <Button asChild variant="outline" size="sm" fullWidth>
            <Link href="/my/edit">정보 수정</Link>
          </Button>
        }
      />
      <RecordSection profile={profile} />
      <MedalSection profile={profile} />
      <PointSummary />
      <Link
        href="/my/challenges"
        className="bg-surface-primary rounded-12 text-label-lg font-label-normal text-fg-primary focus-visible:ring-line-focus flex items-center justify-between gap-3 p-4 focus-visible:ring-2 focus-visible:outline-none"
      >
        종료된 챌린지 전체 보기
        <ChevronRight aria-hidden className="text-fg-tertiary size-5" />
      </Link>
    </main>
  );
}

function MySummarySkeleton() {
  return (
    <main aria-busy="true" aria-label="내 정보를 불러오는 중" className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="rounded-16 h-24" />
      <Skeleton className="rounded-16 h-24" />
      <Skeleton className="rounded-12 h-20" />
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
