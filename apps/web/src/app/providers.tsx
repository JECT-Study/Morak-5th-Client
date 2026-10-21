"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { getQueryClient } from "@/shared/api/query-client";
import AppBridgeListener from "@/shared/native/app-bridge-listener";

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
