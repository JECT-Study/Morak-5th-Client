"use client";

import { RadioGroup } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 여러 개 중 하나를 고르는 세그먼트(예: 공개/비공개, ON/OFF). JDS SegmentedControls 자리를 잇는다.
 * 의미상 라디오 그룹이라 radix RadioGroup으로 만든다. 방향키로 이동하고 스크린리더가 "라디오, n개 중 m번째"로 읽는다.
 *   <SegmentedControl aria-labelledby="…" value={v} onValueChange={setV}>
 *     <SegmentedControl.Item value="PUBLIC">공개</SegmentedControl.Item>
 *   </SegmentedControl>
 * TODO: Figma 시안이 아직 없어 Surface/Neutral/Secondary 바탕 + 선택 칸 흰 면으로 맞췄다.
 */
function Root({ className, ...props }: ComponentProps<typeof RadioGroup.Root>) {
  return (
    <RadioGroup.Root
      data-slot="segmented-control"
      orientation="horizontal"
      className={cn("bg-surface-secondary rounded-8 flex h-8 p-0.5", className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: ComponentProps<typeof RadioGroup.Item>) {
  return (
    <RadioGroup.Item
      data-slot="segmented-control-item"
      className={cn(
        "text-label-sm font-label-normal text-fg-tertiary rounded-6 flex min-w-0 flex-1 items-center justify-center px-2 transition-colors",
        "hover:text-fg-secondary-hover",
        "data-[state=checked]:bg-surface-primary data-[state=checked]:text-fg-primary data-[state=checked]:font-label-strong data-[state=checked]:shadow-[0_1px_2px_rgba(27,28,33,0.12)]",
        "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none",
        "disabled:text-fg-disabled disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export const SegmentedControl = Object.assign(Root, { Item });
