import { Clock3 } from "lucide-react";
import Image from "next/image";

import type { TodayCertification } from "../../types";
import { formatCertifiedTime } from "../../utils";

type TodayCertificationsProps = {
  /** 오늘 인증해야 하는 팀원 수(빈 칸 수 = 대상 − 사진 수) */
  targetCount: number;
  /** 승인된 오늘 인증 사진 */
  certifications: TodayCertification[];
};

/** 오늘 인증한 팀원: 인증 사진(시각 배지)과 아직 인증하지 않은 칸 */
export default function TodayCertifications({
  targetCount,
  certifications,
}: TodayCertificationsProps) {
  const pendingCount = Math.max(targetCount - certifications.length, 0);

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-end gap-1">
        <span className="text-label-md font-label-normal text-fg-primary">오늘 인증한 팀원</span>
        <span className="text-label-sm flex gap-0.5">
          <span className="font-label-strong text-fg-brand-strong">{certifications.length}</span>
          <span className="font-label-normal text-fg-tertiary">/ {targetCount}명</span>
        </span>
      </p>

      {/* 칸은 60~64px로 줄어들며 한 줄에 맞추고, 팀원이 많으면 가로로 스크롤한다. */}
      <ul className="flex scrollbar-none gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {certifications.map(({ memberId, imageUrl, certifiedAt }) => (
          <li
            key={memberId}
            className="rounded-10 bg-surface-secondary relative h-18 max-w-16 min-w-15 flex-1 overflow-hidden"
          >
            <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" />
            <span className="text-label-xs font-label-normal text-fg-primary bg-surface-primary absolute bottom-1 left-1 rounded-full px-1.5">
              {formatCertifiedTime(certifiedAt)}
            </span>
          </li>
        ))}
        {Array.from({ length: pendingCount }, (_, index) => (
          <li
            key={`pending-${index}`}
            aria-label="아직 인증하지 않음"
            className="rounded-10 border-line bg-surface-secondary text-fg-disabled flex h-18 max-w-16 min-w-15 flex-1 items-center justify-center border"
          >
            <Clock3 aria-hidden className="size-6" />
          </li>
        ))}
      </ul>
    </div>
  );
}
