"use client";

import { useEffect, useState, type ReactNode } from "react";

import { worker } from "./browser";

/** MSW 워커가 준비된 뒤에 화면을 그려 첫 요청부터 목 응답을 받게 한다. */
export default function MswProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    worker.start({ onUnhandledFrame: "bypass" }).then(() => setReady(true));
  }, []);

  return ready ? children : null;
}
