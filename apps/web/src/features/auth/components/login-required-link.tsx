"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";

import { ApiError } from "@/shared/api/client";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import { useMyInfo } from "../use-my-info";

/**
 * 로그인이 필요한 화면으로 가는 링크. 로그인하지 않았으면 이동하지 않고 로그인 안내 모달을 띄운다.
 * 토큰 쿠키는 httpOnly라 JS가 읽을 수 없어서, 재발급까지 시도한 내 정보 조회가 401이면 로그인하지 않은 것으로 본다.
 * 아직 확인 중이면 그대로 이동하고, 그 경우는 화면 쪽 LoginRedirect가 로그인으로 보낸다.
 * Button·IconButton의 asChild 안에 그대로 넣어 쓸 수 있다.
 */
export default function LoginRequiredLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const { error } = useMyInfo();
  const loggedOut = error instanceof ApiError && error.status === 401;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Link
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || !loggedOut) return;
          event.preventDefault();
          setOpen(true);
        }}
      />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="로그인이 필요해요"
        description="로그인한 뒤에 이용할 수 있어요."
        confirmLabel="로그인하기"
        cancelLabel="취소"
        onConfirm={() => router.push("/login")}
      />
    </>
  );
}
