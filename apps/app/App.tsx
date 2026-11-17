import {
  BRIDGE_VERSION,
  parseWebToApp,
  toInjectedScript,
  type AppToWeb,
  type WebToApp,
} from "@morak/bridge";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState, type ComponentType, type Ref } from "react";
import { BackHandler, Linking, Platform, Pressable, Share, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  WebView as RNWebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from "react-native-webview";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

import { getNotificationPath, getPushToken } from "./push";

// react-native-webview의 기본 제네릭(P = undefined) 때문에 최신 TS에서 props가 never로 계산된다.
// 동작은 그대로 두고 타입만 바로잡는다.
type WebViewHandle = RNWebView<object>;
const WebView = RNWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

// 실기기에서는 PC의 LAN IP를 넣는다. 예) EXPO_PUBLIC_WEB_URL=http://192.168.0.10:3000
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3000";
const WEB_ORIGIN = new URL(WEB_URL).origin;
const APP_VERSION = "1.0.0";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const webRef = useRef<WebViewHandle>(null);
  const canGoBack = useRef(false);
  const [offline, setOffline] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // 웹이 READY를 보내기 전(앱이 알림으로 켜진 직후 등)에 들어온 이동 경로는 모아 뒀다가 보낸다.
  const webReady = useRef(false);
  const pendingPath = useRef<string | null>(null);

  const sendToWeb = useCallback((message: AppToWeb) => {
    webRef.current?.injectJavaScript(toInjectedScript(message));
  }, []);

  const openPath = useCallback(
    (path: string) => {
      if (webReady.current) sendToWeb({ type: "OPEN_URL", path });
      else pendingPath.current = path;
    },
    [sendToWeb],
  );

  const handleWebMessage = useCallback(
    (message: WebToApp) => {
      switch (message.type) {
        case "READY": {
          SplashScreen.hideAsync();
          webReady.current = true;
          sendToWeb({
            type: "APP_INFO",
            bridgeVersion: BRIDGE_VERSION,
            appVersion: APP_VERSION,
            features: ["share", "push"],
          });
          // 앱이 꺼져 있다가 알림을 눌러 켜진 경우, 그 알림의 경로로 보낸다.
          const lastResponse = Notifications.getLastNotificationResponse();
          const path = pendingPath.current ?? (lastResponse && getNotificationPath(lastResponse));
          pendingPath.current = null;
          Notifications.clearLastNotificationResponse();
          if (path) sendToWeb({ type: "OPEN_URL", path });
          break;
        }
        case "SHARE":
          Share.share({ url: message.url, message: message.title ?? message.url });
          break;
        case "REQUEST_PUSH_TOKEN":
          getPushToken(message.prompt).then(({ status, token }) =>
            sendToWeb({ type: "PUSH_TOKEN", id: message.id, status, token }),
          );
          break;
        case "HAPTIC":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    },
    [sendToWeb],
  );

  const onMessage = (event: WebViewMessageEvent) => {
    // 우리 웹이 보낸 메시지만 처리한다.
    if (!event.nativeEvent.url.startsWith(WEB_ORIGIN)) return;
    const message = parseWebToApp(event.nativeEvent.data);
    if (message) handleWebMessage(message);
  };

  // 앱을 쓰는 중이거나 백그라운드에서 알림을 누르면 그 경로로 보낸다.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const path = getNotificationPath(response);
      if (!path) return;
      Notifications.clearLastNotificationResponse();
      openPath(path);
    });
    return () => subscription.remove();
  }, [openPath]);

  // Android 하드웨어 뒤로가기는 웹 기록부터 되돌린다.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!canGoBack.current) return false;
      webRef.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, []);

  if (offline) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ fontSize: 16 }}>인터넷 연결을 확인해주세요</Text>
          <Pressable
            onPress={() => {
              setOffline(false);
              setReloadKey((key) => key + 1);
            }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: "#30302E",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff" }}>다시 시도</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <WebView
          key={reloadKey}
          ref={webRef}
          source={{ uri: WEB_URL }}
          originWhitelist={[
            `${WEB_ORIGIN}*`,
            "https://kauth.kakao.com*",
            "https://accounts.kakao.com*",
            "http://localhost:3000*",
          ]}
          onMessage={onMessage}
          onNavigationStateChange={(state) => {
            canGoBack.current = state.canGoBack;
          }}
          onShouldStartLoadWithRequest={(request) => {
            if (__DEV__ && request.url.startsWith("http://localhost:3000/")) {
              const fixed = request.url.replace("http://localhost:3000", WEB_ORIGIN);
              webRef.current?.injectJavaScript(`location.replace(${JSON.stringify(fixed)}); true;`);
              return false; // 원래 localhost 이동은 막는다
            }
            if (request.url.startsWith(WEB_ORIGIN) || request.url.startsWith("about:")) return true;
            // 카카오 로그인 화면은 WebView 안에서 연다. 그래야 쿠키가 WebView에 남는다.
            if (
              request.url.startsWith("https://kauth.kakao.com/") ||
              request.url.startsWith("https://accounts.kakao.com/")
            ) {
              return true;
            }
            // 외부 링크는 시스템 브라우저로 연다.
            Linking.openURL(request.url);
            return false;
          }}
          onLoadEnd={() => SplashScreen.hideAsync()}
          onError={() => setOffline(true)}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          sharedCookiesEnabled
          bounces={false}
          webviewDebuggingEnabled={__DEV__}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
