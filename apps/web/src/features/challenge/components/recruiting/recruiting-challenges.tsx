"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/chip";

import { CHALLENGE_CATEGORIES } from "../../create-schema";
import type { RecruitingFilter } from "../../recruiting-types";
import { useRecruitingChallenges } from "../../use-recruiting-challenges";
import { CATEGORY_META } from "../category-picker";
import RecruitingCard from "./recruiting-card";

/**
 * 모집중 탭(위키 5.2): 검색창 + 카테고리 칩 + 모집 중인 공개 챌린지 목록.
 * 검색은 서버 검색이라 입력할 때마다가 아니라 제출(엔터·검색 버튼)할 때 보낸다.
 * 목록 끝이 보이면 다음 페이지를 불러온다.
 */
export default function RecruitingChallenges() {
  const [filter, setFilter] = useState<RecruitingFilter>({});
  const [keywordInput, setKeywordInput] = useState("");

  const submitKeyword = (event: FormEvent) => {
    event.preventDefault();
    const keyword = keywordInput.trim();
    setFilter((prev) => ({ ...prev, keyword: keyword || undefined }));
  };

  const toggleCategory = (category: RecruitingFilter["category"]) =>
    setFilter((prev) => ({ ...prev, category: prev.category === category ? undefined : category }));

  return (
    <main className="flex flex-1 flex-col gap-3 pb-6">
      <div className="flex flex-col gap-3 px-4 pt-2">
        <form role="search" onSubmit={submitKeyword} className="relative flex">
          <input
            type="search"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="챌린지 이름으로 검색"
            aria-label="챌린지 검색"
            enterKeyHint="search"
            className="border-line bg-surface-primary rounded-8 text-body-md font-body-normal text-fg-primary placeholder:text-fg-quaternary focus-visible:border-line-focus h-12 w-full border pr-12 pl-4 outline-none"
          />
          <button
            type="submit"
            aria-label="검색"
            className="text-fg-tertiary absolute top-0 right-0 flex size-12 items-center justify-center"
          >
            <Search aria-hidden className="size-5" />
          </button>
        </form>

        <div
          className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
          aria-label="카테고리"
        >
          <Chip selected={!filter.category} onClick={() => toggleCategory(undefined)}>
            전체
          </Chip>
          {CHALLENGE_CATEGORIES.map((category) => (
            <Chip
              key={category}
              selected={filter.category === category}
              onClick={() => toggleCategory(category)}
            >
              {CATEGORY_META[category].label}
            </Chip>
          ))}
        </div>
      </div>

      <RecruitingList filter={filter} />
    </main>
  );
}

function RecruitingList({ filter }: { filter: RecruitingFilter }) {
  const {
    data,
    error,
    isPending,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRecruitingChallenges(filter);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 목록 끝(sentinel)이 화면에 들어오면 다음 페이지를 부른다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <ul
        aria-busy="true"
        aria-label="챌린지 목록을 불러오는 중"
        className="flex flex-col gap-2 px-4"
      >
        {[0, 1, 2].map((key) => (
          <li key={key} className="bg-surface-tertiary rounded-12 h-[104px] animate-pulse" />
        ))}
      </ul>
    );
  }

  if (error) {
    // TODO: 비로그인 모집중 탭 범위(FE-O2)가 정해지면 401 화면을 맞춘다.
    if (error instanceof ApiError && error.status === 401) {
      return (
        <ListMessage message="로그인하고 함께할 챌린지를 찾아보세요.">
          <Button asChild variant="outline" size="md">
            <Link href="/login">로그인하기</Link>
          </Button>
        </ListMessage>
      );
    }
    return (
      <ListMessage message="정보를 불러오지 못했어요.">
        <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
          다시 시도
        </Button>
      </ListMessage>
    );
  }

  const challenges = data.pages.flatMap((page) => page.items);
  if (challenges.length === 0) {
    const filtered = Boolean(filter.category || filter.keyword);
    return (
      <ListMessage
        message={filtered ? "조건에 맞는 챌린지가 없어요." : "지금 모집 중인 챌린지가 없어요."}
      >
        <Button asChild size="md">
          <Link href="/challenges/new/daily">챌린지 만들기</Link>
        </Button>
      </ListMessage>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2 px-4">
        {challenges.map((challenge) => (
          <li key={challenge.id}>
            <RecruitingCard challenge={challenge} />
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} aria-hidden />
      {isFetchingNextPage && (
        <p className="text-label-sm font-label-normal text-fg-quaternary text-center">
          불러오는 중…
        </p>
      )}
      {/* 다음 페이지 요청이 실패하면 자동으로 다시 부르지 않으므로 직접 다시 시도할 수 있게 한다. */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
            더 보기
          </Button>
        </div>
      )}
    </>
  );
}

function ListMessage({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <p className="text-body-md font-body-normal text-fg-tertiary">{message}</p>
      {children}
    </div>
  );
}
