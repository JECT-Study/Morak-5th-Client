"use client";

import { ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import type { MyParticipationItem } from "../types";
import { useArchivedChallenges } from "../use-archived-challenges";
import { formatPeriod } from "../utils";
import { CATEGORY_META } from "./category-picker";

/**
 * 종료된 챌린지 전체 기록(위키 6.8). 과거 챌린지를 최근 순으로 보이고, 정상·조기 종료를 구분해 표시하지 않는다.
 * 누르면 당시 상세로 간다(종료된 챌린지는 상세가 읽기 전용이고, 인증 탭에서 지난 인증 사진을 볼 수 있다).
 * TODO: 범위(폐기된 챌린지 포함 여부 등)는 [OPEN, FE-O8]이라 서버가 주는 보관함 목록을 그대로 보인다.
 */
export default function ArchivedChallenges() {
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useArchivedChallenges();

  if (isPending) {
    return (
      <main
        aria-busy="true"
        aria-label="지난 챌린지를 불러오는 중"
        className="flex flex-col gap-3 p-4"
      >
        <Skeleton className="rounded-12 h-20" />
        <Skeleton className="rounded-12 h-20" />
        <Skeleton className="rounded-12 h-20" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-body-md font-body-normal text-fg-tertiary">정보를 불러오지 못했어요.</p>
        <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
          다시 시도
        </Button>
      </main>
    );
  }

  const items = data.pages.flatMap((page) => page.items);
  if (items.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-body-md font-body-normal text-fg-tertiary">
          아직 지난 챌린지 기록이 없어요.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-3 p-4">
      <ul aria-label="지난 챌린지" className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.participationId}>
            <ArchivedItem item={item} />
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "불러오는 중이에요" : "더 보기"}
        </Button>
      )}
    </main>
  );
}

function ArchivedItem({ item }: { item: MyParticipationItem }) {
  return (
    <Link
      href={`/challenges/${item.challengeId}`}
      className="bg-surface-primary rounded-12 focus-visible:ring-line-focus flex items-center gap-3 p-3 focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="bg-surface-secondary text-fg-quaternary rounded-8 relative flex size-14 shrink-0 items-center justify-center overflow-hidden">
        {item.coverImageUrl ? (
          // 5분짜리 서명 주소라 최적화하지 않는다
          <Image
            src={item.coverImageUrl}
            alt=""
            fill
            sizes="56px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <ImageIcon aria-hidden className="size-6" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-label-sm font-label-normal text-fg-tertiary">
          {CATEGORY_META[item.category]?.label ?? item.category}
        </span>
        <span className="text-label-lg font-label-strong text-fg-primary truncate">
          {item.title}
        </span>
        <span className="text-label-sm text-fg-tertiary">
          {formatPeriod(item.startDate, item.endDate)}
        </span>
      </span>
      <ChevronRight aria-hidden className="text-fg-tertiary size-5 shrink-0" />
    </Link>
  );
}
