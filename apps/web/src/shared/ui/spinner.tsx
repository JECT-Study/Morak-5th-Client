import Image from "next/image";

import { cn } from "@/shared/lib/utils";

type SpinnerProps = {
  /** 한 변 길이(px). 시안 원본은 80 */
  size?: number;
  /** 스크린리더가 읽는 문구 */
  label?: string;
  className?: string;
};

/**
 * 도는 로딩 표시. Figma "Loading"(주황 그라데이션 고리 + 끝 점, Frame 3→4→5가 회전 단계).
 * 모양을 아는 목록·카드는 Skeleton을, 화면 전체를 기다리거나 결과 모양을 모를 때는 이것을 쓴다.
 * 고리 이미지(public/images/loading)와 점을 함께 돌린다. 점 위치·크기는 시안 비율 그대로다.
 */
export function Spinner({ size = 80, label = "불러오는 중", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-block shrink-0 animate-spin", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/loading/spinner-ring.png"
        alt=""
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
      {/* 시안 79.49 기준 점 11.92(15%), 위치 left 34.18(43%)·top 67.57(85%) */}
      <Image
        src="/images/loading/spinner-dot.svg"
        alt=""
        width={12}
        height={12}
        className="absolute"
        style={{ left: "43%", top: "85%", width: "15%", height: "15%" }}
      />
    </span>
  );
}
