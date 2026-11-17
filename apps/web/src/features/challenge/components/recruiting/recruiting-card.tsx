import { CalendarDays, Coins, ImageIcon, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";

import type { ChallengeListItem } from "../../recruiting-types";
import { formatPeriod } from "../../utils";
import { CATEGORY_META } from "../category-picker";

/**
 * 모집중 목록의 챌린지 한 줄(위키 5.2: 카테고리, 제목, 기간, 참여 포인트, 인원). 누르면 상세로 간다.
 * TODO: 시안이 없어 기존 토큰으로 임시 구성했다. 인증 방법은 목록 응답에 없어 빠져 있다.
 */
export default function RecruitingCard({ challenge }: { challenge: ChallengeListItem }) {
  const { id, title, category, startDate, endDate, capacity, currentCount, pointAmount } =
    challenge;
  const isFull = currentCount >= capacity;

  return (
    <Link
      href={`/challenges/${id}`}
      className="bg-surface-primary rounded-12 focus-visible:ring-line-focus flex gap-3 p-3 focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="bg-photo rounded-8 relative flex size-20 shrink-0 items-center justify-center overflow-hidden">
        {challenge.coverImageUrl ? (
          // TODO: 이미지 저장소 도메인이 정해지면 next.config의 images.remotePatterns에 등록하고 최적화를 켠다.
          <Image
            src={challenge.coverImageUrl}
            alt=""
            fill
            sizes="80px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <ImageIcon aria-hidden className="text-fg-disabled size-6" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <Badge variant="neutral" size="sm">
            {CATEGORY_META[category].label}
          </Badge>
          {isFull && (
            <Badge variant="outline" size="sm">
              모집 마감
            </Badge>
          )}
        </div>
        <h2 className="text-label-lg font-label-strong text-fg-primary truncate">{title}</h2>
        <dl className="text-body-xs font-body-normal text-fg-tertiary flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <dt className="sr-only">기간</dt>
            <CalendarDays aria-hidden className="size-3.5 shrink-0" />
            <dd className="truncate">{formatPeriod(startDate, endDate)}</dd>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <dt className="sr-only">인원</dt>
              <Users aria-hidden className="size-3.5 shrink-0" />
              <dd>
                {currentCount}/{capacity}명
              </dd>
            </div>
            {pointAmount > 0 && (
              <div className="flex items-center gap-1">
                <dt className="sr-only">참여 포인트</dt>
                <Coins aria-hidden className="size-3.5 shrink-0" />
                <dd>참여 포인트 {pointAmount.toLocaleString("ko-KR")}P</dd>
              </div>
            )}
          </div>
        </dl>
      </div>
    </Link>
  );
}
