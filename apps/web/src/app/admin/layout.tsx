import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "모락 어드민",
  robots: { index: false, follow: false },
};

/**
 * 운영진 화면은 데스크톱 폭으로 쓴다. 루트 레이아웃이 모바일 폭(max-w-app)으로 감싸므로
 * 그 위를 화면 전체로 덮고 스크롤은 여기서 한다. (z-index를 주지 않아 JDS 다이얼로그가 위에 뜬다.)
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background-secondary fixed inset-0 overflow-auto">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-8">{children}</div>
    </div>
  );
}
