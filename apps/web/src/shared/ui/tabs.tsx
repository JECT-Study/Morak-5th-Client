"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 탭(밑줄형, 칸을 꽉 채움). JDS Tabs(variant="header", isItemStretched) 자리를 잇는다.
 * radix Tabs라 방향키로 탭을 옮기고, 탭과 내용이 aria-controls·aria-labelledby로 이어진다.
 * TODO: Figma 시안이 아직 없어 선택 탭은 Foreground/Neutral/Primary 글자 + 2px 밑줄로 맞췄다.
 */
export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("border-line-subtle flex border-b", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-label-lg font-label-normal text-fg-quaternary -mb-px flex h-12 flex-1 items-center justify-center border-b-2 border-transparent transition-colors",
        "hover:text-fg-secondary",
        "data-[state=active]:border-fg-primary data-[state=active]:text-fg-primary data-[state=active]:font-label-strong",
        "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("focus-visible:outline-none", className)}
      {...props}
    />
  );
}
