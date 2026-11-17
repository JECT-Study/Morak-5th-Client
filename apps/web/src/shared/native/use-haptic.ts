// apps/web/src/shared/native/use-haptic.ts
"use client";

import { useCallback } from "react";

import { sendToApp } from "./bridge";

type HapticStyle = "light" | "medium" | "success";

const VIBRATE_MS: Record<HapticStyle, number> = { light: 10, medium: 20, success: 30 };

/** 앱에서는 네이티브 햅틱, 브라우저에서는 지원하면 진동(Android Chrome), 아니면 아무것도 안 한다. */
export function useHaptic() {
  return useCallback((style: HapticStyle = "success") => {
    if (sendToApp({ type: "HAPTIC", style })) return;
    navigator.vibrate?.(VIBRATE_MS[style]);
  }, []);
}
