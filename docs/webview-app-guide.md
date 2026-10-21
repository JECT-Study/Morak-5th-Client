# 웹뷰 앱 가이드

모락은 Next.js 웹을 화면으로 쓰고, Expo(React Native) 껍데기 앱이 그 웹을 WebView로 띄워 스토어에 배포한다.
이 문서는 웹뷰 구조에서 놓치기 쉬운 부분과 브릿지·딥링크 구현 방식을 정리한 것이다. 구현 전에 한 번씩 다시 확인한다.

## 1. 전체 구조

```
┌──────────── 휴대폰 ─────────────┐
│  Expo 앱 (RN 껍데기)            │
│  ├─ 네이티브: 푸시·햅틱·공유·    │        ┌──────────────┐     ┌──────────────┐
│  │   딥링크·뒤로가기·스플래시     │        │ Next.js      │     │ Spring       │
│  └─ <WebView>  ◀── 브릿지 ──▶    │ HTTPS  │ (Vercel)     │     │ (EC2)        │
│       모락 웹 화면  ─────────────┼──────▶ │ 화면 + BFF   │ ──▶ │ REST API     │
│       (쿠키만 보유)  ── WS ──────┼────────┼──────────────┼───▶ │ /ws          │
└─────────────────────────────────┘        └──────────────┘     └──────────────┘
```

| 계층            | 역할                                                                       | 배포                           |
| --------------- | -------------------------------------------------------------------------- | ------------------------------ |
| RN 껍데기       | WebView, 네이티브 기능, 딥링크·푸시 수신, 뒤로가기, 스플래시·오프라인 화면 | EAS Build·Submit (스토어 심사) |
| 웹 (Next)       | 모든 화면과 UI 로직, 브릿지 호출                                           | Vercel (즉시 반영)             |
| BFF (Next 서버) | 토큰을 HttpOnly 쿠키로 보관, Spring 대리 호출                              | 웹과 함께                      |
| Spring          | 데이터·규칙·푸시 발송                                                      | EC2                            |

원칙: **껍데기는 얇게.** 화면 로직이 RN으로 넘어가면 수정할 때마다 심사를 받아야 한다. RN에는 웹이 할 수 없는 일만 둔다.

## 2. 꼭 알아야 할 것

### 로그인·쿠키

- **소셜 로그인은 WebView 안에서 하지 않는다.** 구글은 임베디드 WebView OAuth를 차단한다(`disallowed_useragent`).
  시스템 브라우저(`expo-web-browser`의 `openAuthSessionAsync`: Android Chrome Custom Tabs, iOS ASWebAuthenticationSession)나 네이티브 SDK를 쓴다.
- **시스템 브라우저의 쿠키는 WebView와 공유되지 않는다.** 결과를 넘기는 단계가 필요하다.
  1. RN이 시스템 브라우저로 BFF 로그인 주소(`/api/auth/kakao`)를 연다.
  2. 로그인 완료 후 BFF가 일회용 코드를 붙여 `morak://auth?code=…`로 리다이렉트한다.
  3. RN이 코드를 받아 WebView에 `/api/auth/exchange?code=…`를 연다.
  4. BFF가 코드를 확인하고 **WebView에** HttpOnly 쿠키를 심는다.
- **쿠키는 WebView 쿠키 저장소에 HttpOnly로 저장된다.** 웹 JS와 RN은 토큰을 읽지 못한다.
  - 로그인 여부 판단: 서버 컴포넌트나 `proxy`(Next 16, 구 middleware)에서 쿠키를 읽거나, 클라이언트에서 `/api/auth/me`를 호출한다.
- iOS WKWebView 쿠키는 Safari와 분리돼 있다. 앱 로그인은 앱 안에서만 유지된다.

### 화면·조작

- **헤더 뒤로가기는 웹(`router.back()`)으로 처리한다.** WebView 기록이 곧 웹 기록이다.
  - 딥링크로 바로 들어와 기록이 없으면 홈으로 보내는 대체 처리를 둔다.
- **시스템 뒤로가기는 네이티브가 맡는다.** Android 하드웨어 뒤로가기는 `BackHandler` → `webview.goBack()`, iOS 스와이프는 `allowsBackForwardNavigationGestures`.
- 안전 영역·키보드: `viewport-fit=cover`, `env(safe-area-inset-*)`, `100dvh`. iOS 키보드 동작은 실기기에서 확인한다.
- 앱다운 처리: 바운스 스크롤(`bounces={false}`), 확대, 길게 누르기 메뉴를 필요에 따라 끈다.

### 로딩·네트워크

- **첫 실행:** 원격 URL을 매번 불러오므로 `expo-splash-screen`을 웹 `READY`(또는 `onLoadEnd`)까지 유지한다. 이후는 웹 스켈레톤.
- **오프라인:** 시작부터 오프라인이면 RN 자체 화면(재시도 버튼). 사용 중 끊기면 웹이 안내.
- **웹소켓:** WebView에서 동작한다. 백그라운드 전환 시 OS가 끊으므로 복귀할 때 새 티켓으로 재연결한다.
- **백그라운드 알림:** 서버가 소켓에 연결되지 않은 수신자에게 Expo Push로 보낸다. OS가 알림을 띄우므로 앱 종료 상태에서도 받는다. 화면에 떠 있을 때는 소켓으로 받는다.

### 보안

- `originWhitelist`: WebView에서 열 **출처(스킴+호스트)** 목록. 경로 단위가 아니다.
- `onShouldStartLoadWithRequest`: 우리 도메인이 아니면 막고 `Linking.openURL`로 시스템 브라우저에서 연다.
- `onMessage`: `event.nativeEvent.url`이 우리 도메인인지 확인하고, 메시지가 정의된 타입인지 검증한다. 모르는 타입은 무시한다.

### 배포·버전

- 네이티브 모듈 추가(푸시, 햅틱, 권한 등)는 새 빌드 + 심사가 필요하다. **첫 빌드에 필요한 네이티브 기능을 모두 넣는다.**
- 껍데기의 JS만 바뀌면 EAS Update로 심사 없이 배포할 수 있다. 웹 화면 수정은 Vercel 배포로 끝난다.
- 사용자 폰에는 예전 껍데기가 남아 있다. 껍데기가 앱 버전과 지원 기능을 웹에 알려주고, 웹은 확인 후 사용한다.
- 웹뷰만 감싼 앱은 애플 심사 4.2(최소 기능)에서 반려될 수 있다. 푸시·햅틱·공유·딥링크·오프라인 화면을 갖춘다.

### 디버깅

- iOS: `webviewDebuggingEnabled` 설정 후 맥 Safari 개발자 메뉴.
- Android: 크롬 `chrome://inspect`.

## 3. 브릿지 (웹 ↔ RN)

전달 수단만 정해져 있고, 메시지 타입은 우리가 설계하는 프로토콜이다.

| 방향    | 수단                                                                       |
| ------- | -------------------------------------------------------------------------- |
| 웹 → RN | `window.ReactNativeWebView.postMessage(문자열)` → RN `onMessage`           |
| RN → 웹 | `webviewRef.current.injectJavaScript("window.__onAppMessage(...); true;")` |

RN → 웹에 `postMessage`를 쓰면 웹에서 받는 위치가 iOS(`window`)와 Android(`document`)에서 다르다. `injectJavaScript`로 전역 함수를 호출하면 두 플랫폼이 같게 동작한다. 주입 코드 끝에는 `true;`를 붙인다.

### 메시지 타입 (초안)

```ts
type WebToApp =
  | { type: "READY" }
  | { type: "HAPTIC"; style: "light" | "success" }
  | { type: "SHARE"; url: string; title?: string }
  | { type: "REQUEST_PUSH_TOKEN"; id: string };

type AppToWeb =
  | { type: "APP_INFO"; version: string; features: string[] }
  | { type: "PUSH_TOKEN"; id: string; token: string | null }
  | { type: "OPEN_URL"; path: string };
```

- 응답이 필요한 요청은 `id`로 짝을 맞추고 웹에서 Promise로 감싼다(`pending` Map).
- 웹에서 RN 메시지를 듣는 컴포넌트가 여러 개일 수 있으므로 구독자 함수를 `Set`으로 관리한다(중복 등록 방지, 해제 용이).
- 브라우저에서는 `window.ReactNativeWebView`가 없으므로 `isApp()`으로 확인하고 대체 동작을 한다(공유 → 링크 복사 등).
- 타입 정의는 웹과 RN이 같아야 한다. 레포가 다르면 파일을 복사해 맞춘다.

## 4. 딥링크

### 방식

| 방식                                  | 예시                              | 비고                                                             |
| ------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| 커스텀 스킴                           | `morak://challenge/123`           | 설정이 쉽다. 앱이 없으면 동작하지 않는다. 로그인 콜백용으로 사용 |
| 유니버설 링크(iOS) / 앱 링크(Android) | `https://morak.app/challenge/123` | 앱이 있으면 앱, 없으면 웹이 열린다. 초대·공유 링크에 사용        |

- **유니버설 링크:** 우리 도메인의 일반 https 주소를 누르면 설치된 앱이 바로 열리는 iOS 기능. 도메인의 `apple-app-site-association`으로 앱 소유를 검증한다. Android는 `assetlinks.json`(App Links).
- **커스텀 도메인 필수:** 스토어 배포로 링크용 주소가 생기지 않는다. 딥링크 주소는 웹 도메인이다. Vercel은 그대로 쓰되 영구 커스텀 도메인을 연결한다(도메인이 바뀌면 공유된 링크와 앱 설정이 모두 깨진다).
- 검증 파일은 Next에서 `/.well-known/`로 서빙한다(JSON content-type, 리다이렉트 없음).
- 지연 딥링크(미설치 → 설치 후 해당 화면)는 외부 서비스가 필요하다. MVP 제외.

### Expo 설정

```json
{
  "expo": {
    "scheme": "morak",
    "ios": { "associatedDomains": ["applinks:morak.app"] },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            { "scheme": "https", "host": "morak.app", "pathPrefix": "/challenge" },
            { "scheme": "https", "host": "morak.app", "pathPrefix": "/invite" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 링크를 받는 곳

warm/cold는 시간이 아니라 **앱 프로세스가 살아 있는지**로 나뉜다. 잠깐 나갔다 와도 OS가 정리했다면 cold다.

| 상황                                     | RN에서 받는 곳                                          | 처리                               |
| ---------------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| cold (앱 종료 상태에서 링크로 실행)      | `Linking.getInitialURL()`                               | WebView 첫 `source`를 해당 경로로  |
| warm (백그라운드에서 복귀, 사용 중 링크) | `Linking.addEventListener("url")`                       | `OPEN_URL` 메시지로 웹 라우터 이동 |
| 푸시 탭 (cold)                           | `Notifications.getLastNotificationResponseAsync()`      | 알림 `data.url`을 첫 경로로        |
| 푸시 탭 (warm)                           | `Notifications.addNotificationResponseReceivedListener` | `OPEN_URL` 메시지                  |

- 웹은 `OPEN_URL`을 받으면 `router.push(path)`로 이동한다(`Providers`에 리스너 컴포넌트 하나).
- WebView가 로딩 중이면 주입이 유실될 수 있다. 웹이 `READY`를 보내기 전에 온 링크는 RN이 큐에 쌓았다가 보낸다.
- 껍데기는 화면이 WebView 하나이므로 Expo Router 없이 `Linking`만 쓴다.

### 백엔드와 합의할 것

- 푸시 알림 `data`에 이동할 경로를 넣는다. 예) `{ url: "/challenge/123?tab=feed", type: "VERIFY_REJECTED" }`
- 앱 내 알림 목록도 같은 화면으로 이동해야 하므로 `NOTIFICATION`에 `link_url`(또는 `target_type`·`target_id`)이 필요하다.
- **URL 경로 규칙을 FE·BE가 같이 정한다.**

## 5. 미리 정해야 할 것

- [ ] 커스텀 도메인 (PM)
- [ ] 소셜 로그인 방식: 시스템 브라우저 + 일회용 코드 교환 vs 네이티브 SDK (BE)
- [ ] 딥링크·알림 URL 경로 규칙 (BE)
- [ ] 첫 빌드에 넣을 네이티브 기능 목록
