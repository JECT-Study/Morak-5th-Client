import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MyUserInfo } from "@/features/auth/types";
import { request } from "@/shared/api/client";
import { compressImage } from "@/shared/lib/compress-image";

/** 프로필 사진은 작게 보여서 긴 변 800px이면 충분하다. */
const PROFILE_IMAGE_EDGE = 800;

/**
 * 프로필 사진 변경·삭제(위키 6.3). 둘 다 갱신된 내 정보가 와서 내 정보 캐시를 바로 바꾸고,
 * 마이페이지가 읽는 내 프로필은 다시 받는다.
 */
export function useProfileImage(userId: number) {
  const queryClient = useQueryClient();
  const onSuccess = async (updated: MyUserInfo) => {
    queryClient.setQueryData(["users", "me"], updated);
    await queryClient.invalidateQueries({ queryKey: ["users", userId, "profile"] });
  };

  const change = useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append("profileImage", await compressImage(image, PROFILE_IMAGE_EDGE));
      return request<MyUserInfo>("/api/users/me/profile-image", { method: "PUT", formData });
    },
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: () => request<MyUserInfo>("/api/users/me/profile-image", { method: "DELETE" }),
    onSuccess,
  });

  return { change, remove };
}
