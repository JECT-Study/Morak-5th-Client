import type { AdStatus } from "@morak/bridge";
import MobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { Platform } from "react-native";

/**
 * 보상형 광고 단위 ID.
 * - 개발 중(__DEV__)에는 구글 테스트 광고 단위를 쓴다. 실제 광고가 나가지 않고 계정에 불이익도 없다.
 * - 운영에서는 빌드 환경변수로 받는다. 비어 있으면 광고를 쓸 수 없는 빌드로 보고 unavailable로 답한다.
 *   (EXPO_PUBLIC_* 값은 번들러가 이름을 그대로 찾아 바꾸므로 process.env[...]처럼 동적으로 읽지 않는다)
 */
const TEST_REWARDED_AD_UNIT = Platform.select({
  android: "ca-app-pub-3940256099942544/5224354917",
  ios: "ca-app-pub-3940256099942544/1712485313",
});

const getRewardedAdUnitId = (): string | undefined => {
  if (__DEV__) return TEST_REWARDED_AD_UNIT;
  const adUnitId = Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
  });
  return adUnitId || undefined;
};

/** 이 빌드에 보상형 광고 단위 ID가 있는지. 없으면 웹에 "ad" 기능을 알리지 않는다. */
export const hasRewardedAdUnit = () => getRewardedAdUnitId() !== undefined;

let initialization: Promise<boolean> | null = null;

/**
 * 광고 SDK를 앱 시작 때 한 번 초기화한다. 몇 번을 불러도 같은 결과를 돌려준다.
 * 실패해도 throw하지 않고 false로 알린다(광고는 부가 기능이라 앱 실행을 막지 않는다).
 */
export function initializeAds(): Promise<boolean> {
  initialization ??= MobileAds()
    .initialize()
    .then(
      () => true,
      () => false,
    );
  return initialization;
}

/** 광고를 한 번에 하나만 보여준다. 이미 재생 중이면 새 요청은 failed로 답한다. */
let showing = false;

type ShowRewardedAdOptions = {
  /** Spring 사용자 ID 문자열. SSV 알림의 user_id로 서버에 간다. */
  userId: string;
  /** 광고 시청 시작 API가 준 시청 토큰. SSV 알림의 custom_data로 서버에 간다. */
  token: string;
};

/**
 * 보상형 광고를 불러와 보여주고 결과를 돌려준다. throw하지 않고 status로 알린다.
 * - rewarded: 구글이 보상을 인정했다(EARNED_REWARD) 그리고 광고를 닫았다.
 * - closed: 보상 전에 닫았다.
 * - failed: 불러오기·표시 오류, 또는 다른 광고가 재생 중.
 * - unavailable: SDK 초기화 실패, 광고 단위 ID 없음.
 * 포인트는 여기서 지급하지 않는다. 구글이 서버로 보내는 SSV 알림을 서버가 확인해 지급한다.
 */
export async function showRewardedAd({ userId, token }: ShowRewardedAdOptions): Promise<AdStatus> {
  const adUnitId = getRewardedAdUnitId();
  if (!adUnitId || !(await initializeAds())) return "unavailable";
  if (showing) return "failed";
  showing = true;

  return new Promise<AdStatus>((resolve) => {
    let rewarded = false;
    let settled = false;
    let ad: RewardedAd | undefined;

    // 결과는 한 번만 보낸다. 닫힘·오류 이벤트가 겹쳐 와도 첫 결과만 쓴다.
    const finish = (status: AdStatus) => {
      if (settled) return;
      settled = true;
      showing = false;
      ad?.removeAllListeners();
      ad?.destroy();
      resolve(status);
    };

    try {
      // 구글 SSV 알림에 userId·customData가 그대로 실린다. 서버가 주인과 시청 토큰을 확인한다.
      ad = RewardedAd.createForAdRequest(adUnitId, {
        serverSideVerificationOptions: { userId, customData: token },
      });
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        ad?.show().catch(() => finish("failed"));
      });
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewarded = true;
      });
      ad.addAdEventListener(AdEventType.ERROR, () => finish(rewarded ? "rewarded" : "failed"));
      ad.addAdEventListener(AdEventType.CLOSED, () => finish(rewarded ? "rewarded" : "closed"));
      ad.load();
    } catch {
      finish("failed");
    }
  });
}
