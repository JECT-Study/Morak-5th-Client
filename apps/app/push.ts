import type { PushStatus } from "@morak/bridge";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/** Android 알림 채널 id. BE가 보내는 channelId, app.json의 defaultChannel과 같아야 한다. */
const ANDROID_CHANNEL_ID = "default";

type PushTokenResult = { status: PushStatus; token: string | null };

const UNAVAILABLE: PushTokenResult = { status: "unavailable", token: null };

/** 앱을 보고 있을 때 온 알림도 배너로 보여준다. 꺼져 있거나 백그라운드면 OS가 띄운다. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Android 8+는 모든 알림이 채널에 속해야 하고, 13+는 채널이 하나라도 있어야 권한 팝업이 뜬다.
 * 그래서 권한을 묻기 전에 만든다. 이름은 사용자가 기기 설정 > 앱 > 알림에서 보는 이름이다.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "기본 알림",
    // expo-notifications가 다시 내보내는 enum을 import/namespace 규칙이 못 찾는다(tsc는 통과).
    // eslint-disable-next-line import/namespace
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/**
 * 알림 권한을 확인하고 Expo 푸시 토큰을 받는다. 실패해도 throw하지 않고 status로 알린다.
 * - prompt=true: 다시 물을 수 있으면 권한 팝업을 띄운다.
 *   (Android 13+는 한 번 거부해도 한 번 더 물을 수 있어서 canAskAgain으로 판단한다)
 * - prompt=false: 묻지 않고, 이미 허용된 경우에만 토큰을 준다.
 */
export async function getPushToken(prompt: boolean): Promise<PushTokenResult> {
  await ensureAndroidChannel();

  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain && prompt) {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (!permission.granted) {
    // 다시 물을 수 없는 거부만 denied(기기 설정으로 안내). 아직 안 물은 건 unavailable.
    return permission.canAskAgain ? UNAVAILABLE : { status: "denied", token: null };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return UNAVAILABLE;

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: "granted", token: data };
  } catch {
    // 네트워크 문제 등으로 발급 실패. 다음 앱 실행 때 다시 시도된다.
    return UNAVAILABLE;
  }
}

/** 웹 안에서만 열리도록 "/"로 시작하는 경로만 받는다. "//evil.com"처럼 다른 도메인으로 읽히는 값은 막는다. */
const isSafePath = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

/** 알림을 눌렀을 때 이동할 웹 경로. BE가 data.url에 경로만 넣어 보낸다. 예) "/challenges/123" */
export function getNotificationPath(response: Notifications.NotificationResponse): string | null {
  if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return null;
  const url = response.notification.request.content.data?.url;
  return isSafePath(url) ? url : null;
}
