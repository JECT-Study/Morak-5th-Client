"use client";

import { BlockButton } from "@jects/jds";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";
import AppHeader from "@/shared/layout/app-header";

import { toOnboardingRequest } from "../profile";
import { useOnboardingGuard } from "../use-onboarding-guard";
import {
  NICKNAME_TAKEN,
  useCheckNickname,
  useCompleteOnboarding,
} from "../use-onboarding-mutations";
import { useProfileForm } from "../use-profile-form";
import DoneStep from "./done-step";
import GuideStep from "./guide-step";
import ProfileStep from "./profile-step";

type Step = "profile" | "guide" | "done";

const STEP_TITLE: Record<Step, string> = {
  profile: "모락 시작하기",
  guide: "모락 이용 안내",
  done: "준비 완료",
};

/**
 * 온보딩 3화면(정보 입력 → 이용 안내 → 준비 완료). 화면 정의서 "온보딩_화면정의서".
 * - 약관 동의 전이면 로그인 화면의 약관 시트로, 이미 온보딩을 마쳤으면 홈으로 보낸다.
 * - 입력값은 이 화면 안에서만 들고 있다가 '확인했어요'에서 한 번에 저장한다.
 *   중간에 나갔다 오면 정보 입력부터 다시 한다(건너뛰기 없음).
 */
export default function OnboardingFlow() {
  const router = useRouter();
  const { data: me, isError } = useMyInfo();
  const [step, setStep] = useState<Step>("profile");

  useOnboardingGuard({ me, isError, enabled: step !== "done" });

  const { form, errors, updateForm, validate, setFieldError } = useProfileForm(
    me ? me.nickname : undefined,
  );
  const nicknameCheck = useCheckNickname();
  const onboarding = useCompleteOnboarding({
    onNicknameTaken: () => {
      setFieldError("nickname", NICKNAME_TAKEN);
      setStep("profile");
    },
  });

  const moveTo = (next: Step) => {
    setStep(next);
    window.scrollTo(0, 0);
  };

  const goToGuide = () => {
    if (!validate()) return;
    nicknameCheck.mutate(form.nickname.trim(), {
      onSuccess: ({ available }) => {
        if (available) moveTo("guide");
        else setFieldError("nickname", NICKNAME_TAKEN);
      },
      onError: () => setFieldError("nickname", "닉네임을 확인하지 못했어요. 다시 시도해 주세요."),
    });
  };

  const finish = () =>
    onboarding.complete(toOnboardingRequest(form), { onSuccess: () => moveTo("done") });

  const action = {
    profile: { label: "다음", onClick: goToGuide },
    guide: { label: "확인했어요", onClick: finish },
    done: { label: "완료", onClick: () => router.replace("/challenges") },
  }[step];

  const pending = nicknameCheck.isPending || onboarding.isPending;

  return (
    <>
      <AppHeader title={STEP_TITLE[step]} />
      <main className="flex flex-1 flex-col px-6 pt-4 pb-6">
        {step === "profile" && <ProfileStep form={form} errors={errors} onChange={updateForm} />}
        {step === "guide" && <GuideStep />}
        {step === "done" && <DoneStep />}
      </main>
      <div className="bg-page border-stroke-subtler sticky bottom-0 flex flex-col gap-2 border-t px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {onboarding.errorMessage && (
          <p role="alert" className="text-label-sm text-(--color-semantic-feedback-destructive)">
            {onboarding.errorMessage}
          </p>
        )}
        <BlockButton
          size="lg"
          hierarchy="accent"
          disabled={pending || !me}
          onClick={action.onClick}
        >
          {action.label}
        </BlockButton>
      </div>
    </>
  );
}
