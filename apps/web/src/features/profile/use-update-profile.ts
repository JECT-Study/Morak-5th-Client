import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "@/features/auth/onboarding-api";
import { ApiError } from "@/shared/api/client";

/**
 * 프로필 수정(PATCH /users/me, 위키 6.4). 성공하면 내 정보와 내 프로필을 갱신한다.
 * 닉네임이 겹치면(USER_004) onNicknameTaken으로 닉네임 칸에 에러를 띄우게 한다.
 */
export function useUpdateProfile({
  userId,
  onNicknameTaken,
}: {
  userId: number;
  onNicknameTaken: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updated) => {
      queryClient.setQueryData(["users", "me"], updated);
      await queryClient.invalidateQueries({ queryKey: ["users", userId, "profile"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "USER_004") onNicknameTaken();
    },
  });

  const nicknameTaken = mutation.error instanceof ApiError && mutation.error.code === "USER_004";
  return {
    save: mutation.mutate,
    isPending: mutation.isPending,
    /** 따로 처리하지 않은 실패. 입력값은 그대로 둔다(위키 3.2) */
    errorMessage:
      mutation.isError && !nicknameTaken ? "저장하지 못했어요. 다시 시도해 주세요." : null,
  };
}
