import { useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/shared/api/types";

import type { MyUserInfo } from "./types";

const fetchMyInfo = async (): Promise<MyUserInfo> => {
  const response = await fetch("/api/users/me", { credentials: "same-origin" });
  const body = (await response.json()) as ApiResponse<MyUserInfo>;
  if (!body.success) throw new Error(body.error.message);
  return body.data;
};

/** 로그인한 내 정보. 채팅에서 내 메시지를 구분하는 등 여러 화면이 같이 쓴다. */
export const useMyInfo = () =>
  useQuery({ queryKey: ["users", "me"], queryFn: fetchMyInfo, staleTime: 5 * 60 * 1000 });
