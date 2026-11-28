import { parseAppToWeb, type AppFeature, type AppToWeb, type WebToApp } from "@morak/bridge";

/**
 * 웹 쪽 브릿지. 브라우저에서 열리면 앱 기능을 쓰지 않고 false를 돌려준다.
 * 앱 기능을 쓰는 곳에서는 반환값으로 대체 동작(예: 공유 → 링크 복사)을 결정한다.
 */
declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __onAppMessage?: (raw: string) => void;
  }
}

export const isApp = () => typeof window !== "undefined" && !!window.ReactNativeWebView;

export const sendToApp = (message: WebToApp) => {
  if (!isApp()) return false;
  window.ReactNativeWebView!.postMessage(JSON.stringify(message));
  return true;
};

type Listener = (message: AppToWeb) => void;
const listeners = new Set<Listener>();

/** 앱에서 오는 메시지를 구독한다. 반환된 함수로 구독을 해제한다. */
export const onAppMessage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export type AppInfo = Extract<AppToWeb, { type: "APP_INFO" }>;

/**
 * 앱이 READY에 답해 알려준 버전·지원 기능. 브라우저이거나 아직 답이 없으면 null.
 * 앱은 기능 준비가 늦어지면(광고 SDK 초기화 등) APP_INFO를 다시 보내므로 항상 마지막 값을 쓴다.
 */
let appInfo: AppInfo | null = null;
const appInfoListeners = new Set<() => void>();

export const getAppInfo = () => appInfo;

/** 앱 정보가 바뀔 때 알림을 받는다. useSyncExternalStore용. */
export const subscribeAppInfo = (listener: () => void) => {
  appInfoListeners.add(listener);
  return () => {
    appInfoListeners.delete(listener);
  };
};

/** 앱이 이 기능을 지원하는지. 예전 앱이거나 아직 APP_INFO가 오지 않았으면 false. */
export const hasAppFeature = (feature: AppFeature) => !!appInfo?.features.includes(feature);

if (typeof window !== "undefined") {
  window.__onAppMessage = (raw: string) => {
    const message = parseAppToWeb(raw);
    if (!message) return;
    if (message.type === "APP_INFO") {
      appInfo = message;
      appInfoListeners.forEach((listener) => listener());
    }
    listeners.forEach((listener) => listener(message));
  };
}
