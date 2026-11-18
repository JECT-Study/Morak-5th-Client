import type { Metadata, Viewport } from "next";
import "./globals.css";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "모락",
  description: "모두 모이면 즐겁다, 함께하는 자기계발 챌린지",
};

// viewport-fit=cover여야 노치·홈 인디케이터 영역에 env(safe-area-inset-*) 값이 들어온다.
// maximum-scale=1: iOS(Safari·앱 WebView)는 16px보다 작은 입력칸에 포커스가 가면 화면을 확대해
// 가로 스크롤이 생긴다. 시안 입력 글자가 14px이라 확대를 막는다. (안드로이드는 손가락 확대도 막힌다)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="antialiased">
      <body className="bg-surface-tertiary">
        <Providers>
          {/* 모바일 화면 폭으로 가운데 정렬한다. 넓은 화면에서는 양옆에 바깥 배경이 보인다. */}
          <div className="max-w-app bg-background-secondary mx-auto flex min-h-dvh w-full flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
