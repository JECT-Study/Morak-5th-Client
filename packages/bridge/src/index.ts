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

/**
 * 푸시 알림을 받을 수 있는 상태.
 * - granted: 권한 허용, token에 Expo 푸시 토큰이 있다.
 * - denied: 사용자가 거부했다. 앱 안에서 다시 물을 수 없으니 기기 설정으로 안내한다.
 * - unavailable: 받을 수 없는 환경(브라우저, 시뮬레이터, 푸시를 붙이지 않은 앱, 토큰 발급 실패).
 */
export type PushStatus = "granted" | "denied" | "unavailable";

export type WebToApp =
  | { type: "READY" }
  | { type: "HAPTIC"; style: "light" | "medium" | "success" }
  | { type: "SHARE"; url: string; title?: string }
  /** 알림 권한을 묻고(아직 안 물었으면) Expo 푸시 토큰을 받는다. 같은 id의 PUSH_TOKEN으로 답한다. */
  | { type: "REQUEST_PUSH_TOKEN"; id: string };

export type AppToWeb =
  | { type: "APP_INFO"; bridgeVersion: number; appVersion: string; features: AppFeature[] }
  /** REQUEST_PUSH_TOKEN 응답. status가 granted일 때만 token이 있다. */
  | { type: "PUSH_TOKEN"; id: string; status: PushStatus; token: string | null }
  /** 딥링크·알림 탭으로 열 웹 경로. 예) "/challenges/12" */
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
