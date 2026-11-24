import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * 다른 화면으로 옮긴 뒤 한 번 보여 줄 안내 문구(예: 정보 수정 → 마이페이지 "변경 사항이 저장되었어요.").
 * Next가 지나간 화면을 숨긴 채 살려 두기도 해서(다시 그려지지 않음), 쿼리 캐시로 전달해 구독 중인 화면이 바로 받게 한다.
 */
const FLASH_KEY = ["flash"] as const;
const FLASH_MS = 3000;

/** 안내를 남긴다. */
export function useSetFlash() {
  const queryClient = useQueryClient();
  return (message: string) => queryClient.setQueryData<string | null>(FLASH_KEY, message);
}

/** 남겨진 안내. 3초 뒤 지운다. 없으면 null */
export function useFlash() {
  const queryClient = useQueryClient();
  const { data: message = null } = useQuery<string | null>({
    queryKey: FLASH_KEY,
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => queryClient.setQueryData(FLASH_KEY, null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [message, queryClient]);

  return message;
}
