import type { MyUserInfo } from "@/features/auth/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 프로필 사진 변경(PUT /users/me/profile-image). multipart(profileImage 사진 한 장)를 그대로 넘긴다.
 * 응답은 갱신된 내 정보이고 profileImageUrl은 공개 주소다. 이전 사진은 서버가 지운다.
 */
export async function PUT(request: Request) {
  const formData = await request.formData();
  return toRouteResponse(
    await backendFetch<MyUserInfo>("/users/me/profile-image", { method: "PUT", formData }),
  );
}

/** 프로필 사진 삭제(DELETE /users/me/profile-image). profileImageUrl이 null인 내 정보가 온다. */
export async function DELETE() {
  return toRouteResponse(
    await backendFetch<MyUserInfo>("/users/me/profile-image", { method: "DELETE" }),
  );
}
