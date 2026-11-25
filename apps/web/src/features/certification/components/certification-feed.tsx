"use client";

import { Camera, ChevronLeft, ChevronRight, ImageOff, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/shared/api/client";
import { todayKst } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { Skeleton } from "@/shared/ui/skeleton";

import type { CertificationFeedItem, CertificationStatus } from "../types";
import { useCertificationFeed } from "../use-certification";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-11-25" → "11월 25일 (수)" */
const formatDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}월 ${day}일 (${weekday})`;
};

/** "YYYY-MM-DD"에서 하루 더하거나 뺀다 */
const shiftDate = (date: string, days: number) => {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
};

/** 제출 시각(ISO) → KST "06:02" */
const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));

/** 내 인증 상태 라벨(위키 4.3). 판정 대기는 운영진 판정이면 "검수 중", 아니면 "보류" */
const statusLabel = (status: CertificationStatus, reviewedByStaff: boolean) => {
  if (status === "PENDING") return reviewedByStaff ? "검수 중" : "보류";
  if (status === "APPROVED") return "승인";
  if (status === "AUTO_APPROVED") return "자동 승인";
  if (status === "REJECTED") return "거절";
  return "실패";
};

type CertificationFeedProps = {
  challengeId: string;
  /** 챌린지 기간 "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
  /** 오늘 인증할 수 있는 참여자(진행 중 + 참여 중)면 true. 내 오늘 인증 카드를 보인다. */
  canCertify: boolean;
  /** 포인트를 건 공개 챌린지라 운영진이 판정하면 true */
  reviewedByStaff: boolean;
};

/**
 * 챌린지 상세 인증 탭(Figma "일반 참가자 · 인증 탭", 위키 5.8).
 * 날짜 이동(시작일~오늘) → (오늘이면) 내 오늘 인증 상태 → 그날 팀 인증 카드(제출 순).
 * 다른 팀원 인증은 승인된 것만, 내 인증은 판정 대기·거절도 상태 라벨과 함께 온다(서버가 거른다).
 * TODO: 좋아요·한마디는 API가 없어 넣지 않았다. 날짜를 달력으로 고르는 것도 시안이 정해지면 붙인다.
 */
export default function CertificationFeed({
  challengeId,
  startDate,
  endDate,
  canCertify,
  reviewedByStaff,
}: CertificationFeedProps) {
  const today = todayKst();
  // 끝난 챌린지는 마지막 날, 진행 중이면 오늘을 기본으로 보여 준다.
  const lastDate = today < endDate ? today : endDate;
  const [date, setDate] = useState(lastDate);
  const feed = useCertificationFeed(challengeId, date);
  const isToday = date === today;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <IconButton
          size="sm"
          aria-label="이전 날짜"
          disabled={date <= startDate}
          onClick={() => setDate(shiftDate(date, -1))}
        >
          <ChevronLeft aria-hidden />
        </IconButton>
        <p className="border-line rounded-8 text-label-md font-label-normal text-fg-primary flex h-9 flex-1 items-center justify-center gap-3 border">
          {isToday && (
            <span className="bg-surface-brand text-fg-inverse text-label-xs rounded-max px-2 py-0.5">
              오늘
            </span>
          )}
          {formatDate(date)}
        </p>
        <IconButton
          size="sm"
          aria-label="다음 날짜"
          disabled={date >= lastDate}
          onClick={() => setDate(shiftDate(date, 1))}
        >
          <ChevronRight aria-hidden />
        </IconButton>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-6">
        {isToday && canCertify && !feed.isPending && !feed.error && (
          <MyTodayCard
            challengeId={challengeId}
            mine={feed.data?.items.find((item) => item.mine) ?? null}
            reviewedByStaff={reviewedByStaff}
          />
        )}

        {feed.isPending ? (
          <>
            <Skeleton className="rounded-12 h-16" />
            <Skeleton className="rounded-12 h-64" />
          </>
        ) : feed.error ? (
          <FeedError error={feed.error} onRetry={() => feed.refetch()} />
        ) : feed.data.items.length === 0 ? (
          <p className="text-body-sm font-body-normal text-fg-tertiary py-12 text-center">
            아직 올라온 인증이 없어요.
          </p>
        ) : (
          <ul aria-label={`${formatDate(date)} 인증`} className="flex flex-col gap-3">
            {feed.data.items.map((item) => (
              <li key={item.certificationId}>
                <FeedCard item={item} isToday={isToday} reviewedByStaff={reviewedByStaff} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** 내 오늘 인증 상태. 아직 안 했으면 누르면 인증 제출로 간다. */
function MyTodayCard({
  challengeId,
  mine,
  reviewedByStaff,
}: {
  challengeId: string;
  mine: CertificationFeedItem | null;
  reviewedByStaff: boolean;
}) {
  const content = (
    <>
      <span className="bg-surface-tertiary flex size-10 shrink-0 items-center justify-center rounded-full">
        <Camera aria-hidden className="text-fg-secondary size-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-sm font-body-normal text-fg-primary">
          {mine ? "오늘 인증을 제출했어요" : "오늘 인증을 아직 안 했어요"}
        </span>
        <span className="text-label-sm text-fg-tertiary">인증 마감 오늘 23:59</span>
      </span>
      <StatusBadge>{mine ? statusLabel(mine.status, reviewedByStaff) : "미인증"}</StatusBadge>
    </>
  );
  const className =
    "rounded-12 bg-surface-primary flex items-center gap-3 px-4 py-3 text-left focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none";

  if (mine) return <div className={className}>{content}</div>;
  return (
    <Link href={`/challenges/${challengeId}/certifications/new`} className={className}>
      {content}
    </Link>
  );
}

function FeedCard({
  item,
  isToday,
  reviewedByStaff,
}: {
  item: CertificationFeedItem;
  isToday: boolean;
  reviewedByStaff: boolean;
}) {
  const name = item.nickname ?? "알 수 없음";
  const approved = item.status === "APPROVED" || item.status === "AUTO_APPROVED";
  return (
    <article className="border-line rounded-12 bg-surface-primary flex flex-col gap-3 border p-4">
      <header className="flex items-center gap-3">
        <span className="bg-surface-secondary text-fg-tertiary relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {item.profileImageUrl ? (
            // 프로필 사진 저장소 주소라 최적화하지 않는다
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.profileImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserRound aria-hidden className="size-5" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-label-lg font-label-normal text-fg-primary truncate">
            {name}
            {item.mine && <span className="text-fg-tertiary"> (나)</span>}
          </span>
          <span className="text-label-xs text-fg-tertiary">
            {isToday ? "오늘 " : ""}
            {formatTime(item.submittedAt)}
          </span>
        </span>
        {/* 다른 팀원은 승인된 것만 와서, 내 인증이 아직 승인 전일 때만 상태를 붙인다 */}
        {item.mine && !approved && (
          <StatusBadge>{statusLabel(item.status, reviewedByStaff)}</StatusBadge>
        )}
      </header>
      {item.imageUrl ? (
        // 300초짜리 서명 주소라 최적화하지 않는다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={`${name}의 인증 사진`}
          loading="lazy"
          className={cn("rounded-8 bg-surface-secondary aspect-[4/3] w-full object-cover")}
        />
      ) : (
        // 서명에 실패하면 주소가 null로 온다
        <div className="rounded-8 bg-surface-secondary text-fg-tertiary flex aspect-[4/3] w-full flex-col items-center justify-center gap-2">
          <ImageOff aria-hidden className="size-8" />
          <p className="text-body-sm font-body-normal">사진을 불러오지 못했어요</p>
        </div>
      )}
    </article>
  );
}

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="border-line-strong rounded-4 text-label-xs font-label-normal text-fg-neutral shrink-0 border px-1 py-px">
      {children}
    </span>
  );
}

function FeedError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  if (error instanceof ApiError && error.status === 403) {
    return (
      <p className="text-body-sm font-body-normal text-fg-tertiary py-12 text-center">
        참여한 챌린지의 인증만 볼 수 있어요.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <p className="text-body-sm font-body-normal text-fg-tertiary">정보를 불러오지 못했어요.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}
