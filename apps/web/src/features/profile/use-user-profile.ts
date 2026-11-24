import { useQuery } from "@tanstack/react-query";

import { request } from "@/shared/api/client";

import type { UserProfile } from "./types";

/** 사용자 프로필. userId를 모르면(내 정보 로딩 중) 부르지 않는다. */
export const useUserProfile = (userId: number | undefined) =>
  useQuery({
    queryKey: ["users", userId, "profile"],
    queryFn: () => request<UserProfile>(`/api/users/${userId}`),
    enabled: userId !== undefined,
  });
