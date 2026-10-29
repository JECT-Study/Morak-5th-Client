"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { getQueryClient } from "@/shared/api/query-client";
import AppBridgeListener from "@/shared/native/app-bridge-listener";
// 헤더 뒤로가기가 앱 안 기록 위치를 알 수 있도록 첫 이동 전에 history를 감싼다.
import "@/shared/navigation/history";

const shouldMock = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

// msw/browser는 브라우저 전용이라 서버 렌더링 번들에서 제외한다.
const MswProvider = dynamic(() => import("@/mocks/msw-provider"), { ssr: false });

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {shouldMock ? <MswProvider>{children}</MswProvider> : children}
      <AppBridgeListener />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
