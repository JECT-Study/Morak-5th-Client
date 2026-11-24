"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";
import ProfileFields from "@/features/onboarding/components/profile-fields";
import { toOnboardingRequest, type ProfileForm } from "@/features/onboarding/profile";
import { useProfileForm } from "@/features/onboarding/use-profile-form";
import { NICKNAME_TAKEN } from "@/features/onboarding/use-onboarding-mutations";
import AppHeader from "@/shared/layout/app-header";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Skeleton } from "@/shared/ui/skeleton";

import { useSetFlash } from "../flash";
import type { UserProfile } from "../types";
import { useUpdateProfile } from "../use-update-profile";
import { useUserProfile } from "../use-user-profile";

const toForm = (profile: UserProfile): ProfileForm => ({
  nickname: profile.nickname,
  bio: profile.bio ?? "",
  link: profile.profileLinkUrl ?? "",
  interests: profile.interests,
});

/** 저장하면 서버에 보낼 값이 같으면 바뀐 게 없는 것으로 본다(공백만 바꾼 경우 등). */
const sameRequest = (a: ProfileForm, b: ProfileForm) =>
  JSON.stringify(toOnboardingRequest(a)) === JSON.stringify(toOnboardingRequest(b));

/**
 * 정보 수정(위키 6.4). 지금 프로필 값을 채운 닉네임·소개·링크·관심 분야 → 하단 "변경 사항 저장".
 * - 저장 성공: 마이페이지로 돌아가 "변경 사항이 저장되었어요."
 * - 저장 실패: 입력값을 그대로 두고 다시 시도할 수 있게 한다.
 * - `<`: 바꾼 게 있으면 "수정한 내용을 저장하지 않고 나갈까요?"(계속 수정 / 나가기), 없으면 바로 마이페이지로.
 */
export default function ProfileEdit() {
  const { data: me } = useMyInfo();
  const { data: profile, error, refetch, isRefetching } = useUserProfile(me?.userId);

  if (error) {
    return (
      <>
        <AppHeader nested centered title="정보 수정" backHref="/my" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <p className="text-body-md font-body-normal text-fg-tertiary">
            정보를 불러오지 못했어요.
          </p>
          <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
            다시 시도
          </Button>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <AppHeader nested centered title="정보 수정" backHref="/my" />
        <main aria-busy="true" aria-label="정보를 불러오는 중" className="flex flex-col gap-4 p-4">
          <Skeleton className="rounded-12 h-20" />
          <Skeleton className="rounded-12 h-20" />
          <Skeleton className="rounded-12 h-20" />
        </main>
      </>
    );
  }

  // 프로필이 온 뒤에 폼을 만들어야 처음 값이 채워진다.
  return <ProfileEditForm profile={profile} />;
}

function ProfileEditForm({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const setFlash = useSetFlash();
  const [initial] = useState(() => toForm(profile));
  const { form, errors, updateForm, validate, setFieldError } = useProfileForm(null, initial);
  const { save, isPending, errorMessage } = useUpdateProfile({
    userId: profile.userId,
    onNicknameTaken: () => setFieldError("nickname", NICKNAME_TAKEN),
  });
  const [leaving, setLeaving] = useState(false);
  const dirty = !sameRequest(form, initial);

  const goMyPage = () => router.replace("/my");

  const submit = () => {
    if (!validate()) return;
    save(toOnboardingRequest(form), {
      onSuccess: () => {
        setFlash("변경 사항이 저장되었어요.");
        goMyPage();
      },
    });
  };

  return (
    <>
      <AppHeader
        nested
        centered
        title="정보 수정"
        onBack={() => (dirty ? setLeaving(true) : goMyPage())}
      />
      <main className="flex flex-1 flex-col gap-6 px-4 pt-4">
        <ProfileFields form={form} errors={errors} onChange={updateForm} />
      </main>
      <div className="bg-background-primary sticky bottom-0 flex flex-col gap-2 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        {errorMessage && (
          <p role="alert" className="text-label-sm font-label-normal text-danger text-center">
            {errorMessage}
          </p>
        )}
        <Button fullWidth onClick={submit} disabled={isPending}>
          {isPending ? "저장하는 중이에요" : "변경 사항 저장"}
        </Button>
      </div>

      <ConfirmDialog
        open={leaving}
        onOpenChange={setLeaving}
        title="수정한 내용을 저장하지 않고 나갈까요?"
        description="나가면 바꾼 내용은 저장되지 않아요."
        cancelLabel="계속 수정"
        confirmLabel="나가기"
        onConfirm={goMyPage}
      />
    </>
  );
}
