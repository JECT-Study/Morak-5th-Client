"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** 스크롤 위치가 문서 끝을 넘어 있으면 끝으로 되돌린다. */
const clampScroll = () => {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  if (window.scrollY > max) window.scrollTo(0, max);
};

/**
 * 화면을 옮긴 뒤 스크롤 위치를 문서 범위 안으로 되돌린다.
 *
 * iOS 앱 WebView에서 긴 화면(예: 맨 아래로 내린 채팅방)에서 짧은 화면으로 뒤로 가면, 스크롤 위치(scrollY)가
 * 남은 채로 바로잡히지 않는다. 화면은 제자리에 그려지지만 터치 판정은 그만큼 어긋나 아무것도 눌리지 않는다.
 * (Safari·데스크톱 브라우저는 스스로 바로잡아 재현되지 않는다.)
 * 새 화면이 그려지는 시점이 조금씩 달라서 다음 프레임과 잠시 뒤에 한 번 더 확인한다.
 */
export default function ScrollClamp() {
  const pathname = usePathname();

  useEffect(() => {
    const frame = requestAnimationFrame(clampScroll);
    const timer = setTimeout(clampScroll, 300);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
