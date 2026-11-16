"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";

import { cn } from "@/shared/lib/utils";

/**
 * 달력(react-day-picker). JDS DatePicker 자리를 잇는다.
 * 날짜는 버튼이고 방향키로 옮겨 다니며, 고를 수 없는 날은 aria-disabled로 알린다. 요일·월 이름은 한국어.
 * 렌더링 중에 오늘 날짜(new Date())를 읽으므로, 시트가 열릴 때처럼 사용자가 연 뒤에만 그린다.
 * (cacheComponents에서 페이지와 같이 미리 렌더링되면 에러가 난다)
 * TODO: Figma 시안이 아직 없어 선택일은 브랜드 원, 오늘은 브랜드 글자로 맞췄다.
 */
export function Calendar({ className, classNames, ...props }: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays
      className={cn("w-full max-w-[343px]", className)}
      classNames={{
        months: "relative flex flex-col",
        month: "flex flex-col gap-3",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "text-fg-primary hover:bg-surface-secondary focus-visible:ring-line-focus flex size-10 items-center justify-center rounded-max focus-visible:ring-2 focus-visible:outline-none disabled:text-fg-disabled",
        button_next:
          "text-fg-primary hover:bg-surface-secondary focus-visible:ring-line-focus flex size-10 items-center justify-center rounded-max focus-visible:ring-2 focus-visible:outline-none disabled:text-fg-disabled",
        month_caption: "flex h-10 items-center justify-center",
        caption_label: "text-label-lg font-label-strong text-fg-primary",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-label-sm font-label-normal text-fg-quaternary flex h-8 flex-1 items-center justify-center",
        week: "flex",
        day: "flex aspect-square flex-1 items-center justify-center p-0.5",
        day_button: cn(
          "text-body-md font-body-normal text-fg-primary flex size-full max-h-11 max-w-11 items-center justify-center rounded-max transition-colors",
          "hover:bg-surface-secondary focus-visible:ring-line-focus focus-visible:ring-2 focus-visible:outline-none",
        ),
        selected:
          "[&>button]:bg-surface-brand [&>button]:text-fg-inverse [&>button]:font-body-strong [&>button]:hover:bg-surface-brand-hover",
        today: "[&>button]:text-fg-brand-strong [&>button]:font-body-strong",
        outside: "[&>button]:text-fg-disabled",
        disabled: "[&>button]:text-fg-disabled [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft aria-hidden className="size-5" />
          ) : (
            <ChevronRight aria-hidden className="size-5" />
          ),
      }}
      {...props}
    />
  );
}
