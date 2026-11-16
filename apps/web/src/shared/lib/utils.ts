import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge는 기본 이름만 알아서, 우리가 만든 글자 크기 토큰(text-label-md 등)을
 * 글자 색(text-fg-primary 등)과 같은 그룹으로 보고 하나를 지워 버린다. 크기 토큰을 따로 알려 준다.
 */
const TEXT_SIZES = [
  "title-1",
  "title-2",
  "title-3",
  "title-4",
  "title-5",
  "title-6",
  "title-7",
  "title-8",
  "body-lg",
  "body-md",
  "body-sm",
  "body-xs",
  "body-2xs",
  "label-lg",
  "label-md",
  "label-sm",
  "label-xs",
  "caption",
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: TEXT_SIZES }] } },
});

/** 조건부 클래스(clsx)를 합치고, 겹치는 Tailwind 클래스는 뒤의 것을 남긴다(shadcn 표준 유틸). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
