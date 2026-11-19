import { isServer, QueryClient } from "@tanstack/react-query";

import { ApiError } from "./client";

/** 로그인 필요·권한 없음·없는 대상(401·403·404)은 다시 보내도 결과가 같아 재시도하지 않는다. */
const NO_RETRY_STATUSES = [401, 403, 404];

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 화면 진입 시 캐시를 먼저 보여주고 뒤에서 갱신한다.
        staleTime: 30 * 1000,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && NO_RETRY_STATUSES.includes(error.status)) &&
          failureCount < 1,
        refetchOnWindowFocus: true,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  // 서버에서는 요청마다 새로 만들어 사용자 간 캐시가 섞이지 않게 한다.
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
