"use client";

import type { AdStatus } from "@morak/bridge";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AdRewardSession } from "@/features/ad/types";
import { useMyInfo } from "@/features/auth/use-my-info";
import type { PointLedger } from "@/features/point/types";
import { request } from "@/shared/api/client";

import { requestRewardedAd } from "./ad";
import { useAppFeature } from "./use-app-feature";

/** 구글 알림(SSV)이 서버에 닿기까지 몇 초 걸릴 수 있어서, 잔액이 늘었는지 짧게 몇 번 다시 확인한다. */
const BALANCE_CHECK_INTERVAL_MS = 1_000;
const BALANCE_CHECK_COUNT = 5;

export type RewardedAdResult =
  /** credited가 false면 구글은 보상을 인정했지만 잔액에는 아직 안 보인다("잠시 후 반영돼요") */
  { status: "rewarded"; credited: boolean } | { status: Exclude<AdStatus, "rewarded"> };

const fetchBalance = () =>
  request<PointLedger>("/api/points/me?limit=1")
    .then((ledger) => ledger.balance)
    .catch(() => null);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 잔액이 before보다 늘 때까지 최대 BALANCE_CHECK_COUNT번 확인한다. before를 모르면 확인할 수 없다. */
async function waitForCredit(before: number | null) {
  if (before === null) return false;
  for (let i = 0; i < BALANCE_CHECK_COUNT; i++) {
    await wait(BALANCE_CHECK_INTERVAL_MS);
    const balance = await fetchBalance();
    if (balance !== null && balance > before) return true;
  }
  return false;
}

/**
 * 광고 보고 포인트 받기(보상형 광고).
 * 시청 시작(POST /api/ads/reward-sessions)으로 시청 토큰을 받고 → 앱에 광고를 요청한 뒤 → 결과를 기다린다.
 * 포인트는 웹이 지급하지 않는다. 광고를 끝까지 보면 구글이 서버로 알림(SSV)을 보내고, 서버가 확인해 지급한다.
 * 그래서 rewarded가 오면 잔액이 늘 때까지 잠깐 다시 확인한 뒤 포인트 잔액·내역을 다시 불러온다.
 *
 * - available: 앱이 "ad" 기능을 지원하고 내 정보가 있을 때만 true. false면 화면이 버튼을 숨긴다.
 *   (브라우저, 광고를 모르는 예전 앱, 광고 SDK를 쓸 수 없는 빌드)
 * - show(): 시청을 시작한다. 시작 API가 거절되면(오늘 횟수 소진 등) ApiError가 난다.
 */
export function useRewardedAd() {
  const queryClient = useQueryClient();
  const supported = useAppFeature("ad");
  const { data: me } = useMyInfo();

  const mutation = useMutation({
    mutationFn: async (): Promise<RewardedAdResult> => {
      // 광고를 못 보는 환경이면 시청 세션도 만들지 않는다.
      if (!supported || !me) return { status: "unavailable" };

      // 시작 전 잔액을 기준으로 삼아, 광고를 본 뒤 잔액이 늘었는지 비교한다.
      const [before, session] = await Promise.all([
        fetchBalance(),
        request<AdRewardSession>("/api/ads/reward-sessions", { method: "POST" }),
      ]);

      const status = await requestRewardedAd({ userId: String(me.userId), token: session.token });
      if (status !== "rewarded") return { status };

      const credited = await waitForCredit(before);
      return { status: "rewarded", credited };
    },
    onSuccess: (result) => {
      if (result.status !== "rewarded") return;
      return queryClient.invalidateQueries({ queryKey: ["points", "me"] });
    },
  });

  return {
    available: supported && !!me,
    show: () => mutation.mutateAsync(),
    isPending: mutation.isPending,
  };
}
