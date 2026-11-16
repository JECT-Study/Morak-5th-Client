"use client";

import type { ComponentProps, ReactNode } from "react";
import { Drawer } from "vaul";

type BottomSheetProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 시트 제목. 스크린리더가 대화상자 이름으로 읽는다. */
  title: string;
  /**
   * false면 바깥 누르기·Esc·끌어내리기로 닫히지 않는다(약관 동의처럼 꼭 끝내야 하는 시트).
   * 기본 true
   */
  dismissible?: boolean;
  /** 시트가 닫힐 때 포커스를 돌려줄 곳을 직접 정할 때 쓴다. 기본은 시트를 연 요소로 돌아간다. */
  onCloseAutoFocus?: ComponentProps<typeof Drawer.Content>["onCloseAutoFocus"];
  children: ReactNode;
};

/**
 * 아래에서 올라오는 공통 시트(Figma JDS "🔨 Sheet"). JDS 패키지에 아직 없어 vaul로 만든다.
 * vaul은 radix Dialog 위에 만들어져 포커스 가두기·Esc·뒤 스크롤 막기를 그대로 하고,
 * 끌어내려 닫기와 열림·닫힘 애니메이션을 더한다.
 * JDS에 Sheet가 나오면 이 파일 안쪽만 바꾼다.
 */
export default function BottomSheet({
  open,
  onOpenChange,
  title,
  dismissible = true,
  onCloseAutoFocus,
  children,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={dismissible}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content
          aria-describedby={undefined}
          onCloseAutoFocus={onCloseAutoFocus}
          className="bg-surface-primary border-line-subtle rounded-t-16 fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[767px] flex-col gap-4 border-t px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_0_4px_rgba(27,28,33,0.08),0_3px_8px_rgba(27,28,33,0.12),0_8px_16px_rgba(27,28,33,0.16)] outline-none"
        >
          {/* Figma 손잡이(80×4). vaul은 시트 전체를 끌 수 있어 손잡이는 모양만 둔다. */}
          <div aria-hidden className="mx-auto h-1 w-20 shrink-0 rounded-[2px] bg-[#bab9bf]" />
          <Drawer.Title className="text-title-1 font-title text-fg-primary">{title}</Drawer.Title>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
