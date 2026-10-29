import type { ComponentPropsWithoutRef } from "react";

type SvgIconButtonProps = Omit<ComponentPropsWithoutRef<"button">, "aria-label"> & {
  /** 글자가 없는 버튼이라 접근 이름이 필수다. */
  "aria-label": string;
};

/**
 * JDS IconButton(size="xl", hierarchy="tertiary")과 같은 모양·상호작용의 버튼.
 * JDS IconButton은 패키지에 있는 아이콘 이름만 받으므로, Figma에서 가져온 SVG 아이콘을 넣을 때 쓴다.
 *
 * JDS 0.8.0 스타일을 그대로 옮겼다.
 * - 크기 24px, 아이콘 색 object-alternative
 * - 호버 8%·누름 12% 오버레이(object-neutral), 포커스 링(accent-alpha-alternative 2px)
 * - 오버레이·포커스 링은 버튼보다 3px 크게, radius 4
 */
export default function SvgIconButton({ className, children, ...props }: SvgIconButtonProps) {
  return (
    <button
      type="button"
      className={`text-object-alternative before:rounded-4 after:rounded-4 relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center text-2xl outline-none select-none before:pointer-events-none before:absolute before:-inset-[3px] after:pointer-events-none after:absolute after:-inset-[3px] after:bg-(--color-semantic-object-neutral) after:opacity-0 after:transition-opacity after:duration-(--environment-semantic-duration-100) after:ease-(--environment-semantic-motion-fluent) hover:after:opacity-8 focus-visible:before:z-1 focus-visible:before:shadow-[0_0_0_var(--scheme-semantic-strokeWeight-2)_var(--color-semantic-accent-alpha-alternative)] active:after:opacity-12 active:after:transition-none ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
