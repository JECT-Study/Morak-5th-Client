import { parseAppToWeb, type AppToWeb, type WebToApp } from "@morak/bridge";

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

if (typeof window !== "undefined") {
  window.__onAppMessage = (raw: string) => {
    const message = parseAppToWeb(raw);
    if (!message) return;
    listeners.forEach((listener) => listener(message));
  };
}
