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

  const sendToWeb = useCallback((message: AppToWeb) => {
    webRef.current?.injectJavaScript(toInjectedScript(message));
  }, []);

  const handleWebMessage = useCallback(
    (message: WebToApp) => {
      switch (message.type) {
        case "READY":
          SplashScreen.hideAsync();
          sendToWeb({
            type: "APP_INFO",
            bridgeVersion: BRIDGE_VERSION,
            appVersion: APP_VERSION,
            features: ["share"],
          });
          break;
        case "SHARE":
          Share.share({ url: message.url, message: message.title ?? message.url });
          break;
        case "REQUEST_PUSH_TOKEN":
          // 푸시는 아직 붙이지 않았다.
          sendToWeb({ type: "PUSH_TOKEN", id: message.id, token: null });
          break;
        case "HAPTIC":
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
          originWhitelist={[`${WEB_ORIGIN}*`]}
          onMessage={onMessage}
          onNavigationStateChange={(state) => {
            canGoBack.current = state.canGoBack;
          }}
          onShouldStartLoadWithRequest={(request) => {
            if (request.url.startsWith(WEB_ORIGIN) || request.url.startsWith("about:")) return true;
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
