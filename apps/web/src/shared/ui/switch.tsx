"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 켜기·끄기 스위치. radix Switch라 role="switch"로 읽히고 Space로 토글된다.
 * TODO: Figma에 스위치 시안이 아직 없어 토큰 규칙으로 맞췄다. 시안이 나오면 맞춘다.
 */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "rounded-max bg-surface-tertiary inline-flex h-6 w-10 shrink-0 items-center p-0.5 transition-colors",
        "data-[state=checked]:bg-surface-brand",
        "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="rounded-max bg-surface-primary block size-5 shadow-sm transition-transform data-[state=checked]:translate-x-4" />
    </SwitchPrimitive.Root>
  );
}
