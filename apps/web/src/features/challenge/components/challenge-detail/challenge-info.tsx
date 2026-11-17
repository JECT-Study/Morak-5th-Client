import { CalendarDays, Coins, ImageIcon, LockKeyhole, Users } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/shared/ui/badge";

import { formatPeriodWithDuration } from "../../utils";

type ChallengeInfoProps = {
  title: string;
  /** 카테고리 이름. 예) "생활습관" */
  category: string;
  /** 표지 사진. 없으면 기본 배경과 사진 아이콘을 보여준다. */
  coverImageUrl?: string | null;
  /** 표지 오른쪽 아래 배지. 예) "D-12", "모집 마감" */
  dDayLabel: string;
  /** 챌린지 유형. 예) "데일리". 상세 API에 아직 없어 없으면 표시하지 않는다. */
  typeLabel?: string;
  isPrivate: boolean;
  /** 인증 방식. 예) "사진 인증" */
  verificationLabel: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  memberCount: number;
  capacity: number;
  /** 1인당 참여 포인트. 0이면 포인트 없는 챌린지라 표시하지 않는다. */
  pointAmount: number;
};

/**
 * 챌린지 상세의 상단 정보 카드(Figma "Challenge info").
 * 표지(카테고리·D-day) → 제목 → 태그(유형·공개 여부·인증 방식) → 기간·인원·참여 포인트.
 */
export default function ChallengeInfo({
  title,
  category,
  coverImageUrl,
  dDayLabel,
  typeLabel,
  isPrivate,
  verificationLabel,
  startDate,
  endDate,
  memberCount,
  capacity,
  pointAmount,
}: ChallengeInfoProps) {
  return (
    <article className="bg-surface-primary rounded-12 flex flex-col overflow-hidden">
      <div className="bg-photo relative flex h-[281px] items-end justify-between px-4 py-3">
        {coverImageUrl ? (
          // TODO: 이미지 저장소 도메인이 정해지면 next.config의 images.remotePatterns에 등록하고 최적화를 켠다.
          <Image
            src={coverImageUrl}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="text-fg-disabled absolute inset-0 flex items-center justify-center">
            <ImageIcon aria-hidden className="size-8" />
          </span>
        )}
        <Badge variant="neutral" size="sm" className="relative">
          {category}
        </Badge>
        <Badge variant="outline" size="sm" className="relative">
          {dDayLabel}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <h2 className="text-title-1 font-title text-fg-primary">{title}</h2>

        <ul className="flex gap-2" aria-label="챌린지 특징">
          {typeLabel && (
            <li>
              <Badge variant="outline" size="sm">
                {typeLabel}
              </Badge>
            </li>
          )}
          {isPrivate && (
            <li>
              <Badge variant="outline" size="sm">
                <LockKeyhole aria-hidden />
                비공개
              </Badge>
            </li>
          )}
          <li>
            <Badge variant="outline" size="sm">
              {verificationLabel}
            </Badge>
          </li>
        </ul>

        <dl className="text-fg-tertiary flex flex-col gap-1">
          <InfoItem
            label="기간"
            icon={<CalendarDays aria-hidden className="size-4" />}
            className="text-body-md font-body-normal"
          >
            {formatPeriodWithDuration(startDate, endDate)}
          </InfoItem>
          <div className="flex gap-4">
            <InfoItem label="인원" icon={<Users aria-hidden className="size-4" />}>
              {memberCount}/{capacity}명
            </InfoItem>
            {pointAmount > 0 && (
              <InfoItem label="참여 포인트" icon={<Coins aria-hidden className="size-4" />}>
                {/* Figma 문구는 "보증금"이지만 위키 규칙상 "참여 포인트"로 쓴다. */}
                참여 포인트 {pointAmount.toLocaleString("ko-KR")}P
              </InfoItem>
            )}
          </div>
        </dl>
      </div>
    </article>
  );
}

/** 아이콘 + 값 한 줄. label은 화면에 보이지 않고 스크린리더만 읽는다. */
function InfoItem({
  label,
  icon,
  children,
  className = "text-body-sm font-body-normal",
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <dt className="sr-only">{label}</dt>
      <span aria-hidden className="flex">
        {icon}
      </span>
      <dd>{children}</dd>
    </div>
  );
}
