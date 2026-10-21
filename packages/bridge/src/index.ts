/**
 * 웹(Next)과 앱 껍데기(Expo)가 주고받는 메시지 프로토콜.
 * 웹과 앱이 이 파일 하나를 함께 import해서 타입이 어긋나지 않게 한다.
 *
 * - 웹 → 앱: window.ReactNativeWebView.postMessage(JSON 문자열)
 * - 앱 → 웹: injectJavaScript로 window.__onAppMessage(JSON 문자열) 호출
 */

/** 메시지 구조가 바뀌면 올린다. 앱이 APP_INFO로 자신이 아는 버전을 알려준다. */
export const BRIDGE_VERSION = 1;

/** 앱 껍데기가 지원할 수 있는 기능. 오래된 앱은 일부만 지원할 수 있다. */
export type AppFeature = "haptic" | "share" | "push" | "deeplink";

export type WebToApp =
  | { type: "READY" }
  | { type: "HAPTIC"; style: "light" | "medium" | "success" }
  | { type: "SHARE"; url: string; title?: string }
  | { type: "REQUEST_PUSH_TOKEN"; id: string };

export type AppToWeb =
  | { type: "APP_INFO"; bridgeVersion: number; appVersion: string; features: AppFeature[] }
  | { type: "PUSH_TOKEN"; id: string; token: string | null }
  | { type: "OPEN_URL"; path: string };

const WEB_TO_APP_TYPES: ReadonlySet<string> = new Set<WebToApp["type"]>([
  "READY",
  "HAPTIC",
  "SHARE",
  "REQUEST_PUSH_TOKEN",
]);

const APP_TO_WEB_TYPES: ReadonlySet<string> = new Set<AppToWeb["type"]>([
  "APP_INFO",
  "PUSH_TOKEN",
  "OPEN_URL",
]);

const parse = (raw: string): { type?: unknown } | null => {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null ? (value as { type?: unknown }) : null;
  } catch {
    return null;
  }
};

/** 앱이 웹에서 받은 문자열을 검증한다. 모르는 타입이면 null. */
export const parseWebToApp = (raw: string): WebToApp | null => {
  const msg = parse(raw);
  return msg && typeof msg.type === "string" && WEB_TO_APP_TYPES.has(msg.type)
    ? (msg as WebToApp)
    : null;
};

/** 웹이 앱에서 받은 문자열을 검증한다. 모르는 타입이면 null. */
export const parseAppToWeb = (raw: string): AppToWeb | null => {
  const msg = parse(raw);
  return msg && typeof msg.type === "string" && APP_TO_WEB_TYPES.has(msg.type)
    ? (msg as AppToWeb)
    : null;
};

/** 앱이 웹에 메시지를 보낼 때 injectJavaScript에 넣을 코드를 만든다. */
export const toInjectedScript = (msg: AppToWeb) =>
  `window.__onAppMessage && window.__onAppMessage(${JSON.stringify(JSON.stringify(msg))}); true;`;
