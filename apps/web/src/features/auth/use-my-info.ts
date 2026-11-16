import { useQuery } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { MyUserInfo } from "./types";

const fetchMyInfo = () => request<MyUserInfo>("/api/users/me");

/** 로그인한 내 정보. 채팅에서 내 메시지를 구분하는 등 여러 화면이 같이 쓴다. */
export const useMyInfo = () =>
  useQuery({ queryKey: ["users", "me"], queryFn: fetchMyInfo, staleTime: 5 * 60 * 1000 });
