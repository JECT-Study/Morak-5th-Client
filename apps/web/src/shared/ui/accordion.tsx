"use client";

import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

/**
 * 접고 펴는 목록(radix Accordion). JDS Accordion(isStretched) 자리를 잇는다.
 * 제목은 버튼이라 Enter·Space로 펼치고, 펼침 상태를 aria-expanded로 알린다.
 * TODO: Figma 시안이 아직 없어 Line/Neutral/Subtle 구분선 + 오른쪽 화살표로 맞췄다.
 */
function Root(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function Item({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-line-subtle border-b", className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "text-label-lg font-label-strong text-fg-primary flex min-h-14 flex-1 items-center justify-between gap-3 py-3 text-left",
          "focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none",
          "[&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden
          className="text-fg-tertiary size-5 shrink-0 transition-transform"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function Content({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" {...props}>
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export const Accordion = Object.assign(Root, { Item, Trigger, Content });
