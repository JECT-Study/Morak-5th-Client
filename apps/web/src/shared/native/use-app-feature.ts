"use client";

import type { AppFeature } from "@morak/bridge";
import { useSyncExternalStore } from "react";

import { hasAppFeature, subscribeAppInfo } from "./bridge";

/**
 * 앱이 이 기능을 지원하는지. 브라우저이거나 기능을 모르는 예전 앱이면 false라서,
 * 화면이 해당 버튼을 숨기는 데 쓴다. 앱이 APP_INFO를 보내는 순간 true로 바뀐다.
 * 서버 렌더링과 첫 렌더는 항상 false다(앱 여부는 브라우저에서만 알 수 있다).
 */
export const useAppFeature = (feature: AppFeature) =>
  useSyncExternalStore(
    subscribeAppInfo,
    () => hasAppFeature(feature),
    () => false,
  );
