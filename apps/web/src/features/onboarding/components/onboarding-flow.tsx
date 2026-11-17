"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";
import AppHeader from "@/shared/layout/app-header";
import { Button } from "@/shared/ui/button";

import { toOnboardingRequest } from "../profile";
import { useOnboardingGuard } from "../use-onboarding-guard";
import {
  NICKNAME_TAKEN,
  useCheckNickname,
  useCompleteOnboarding,
} from "../use-onboarding-mutations";
import { useProfileForm } from "../use-profile-form";
import DoneStep from "./done-step";
import GuideStep, { GUIDES, type GuideValue } from "./guide-step";
import ProfileStep from "./profile-step";
import StartStep from "./start-step";

type Step = "start" | "profile" | "guide" | "done";

const STEP_TITLE: Record<Step, string> = {
  start: "모락 시작하기",
  profile: "모락 시작하기",
  guide: "모락 이용 안내",
  done: "준비 완료",
};

/** 뒤로가기로 돌아갈 단계. 시작 화면은 처음이라 뒤로가기가 없다. */
const PREV_STEP: Partial<Record<Step, Step>> = { profile: "start", guide: "profile" };

/**
 * 온보딩 4화면(시작 → 정보 입력 → 이용 안내 → 준비 완료). Figma "온보딩".
 * - 약관 동의 전이면 로그인 화면의 약관 시트로, 이미 온보딩을 마쳤으면 홈으로 보낸다.
 * - 입력값은 이 화면 안에서만 들고 있다가 '확인했어요'에서 한 번에 저장한다.
 *   중간에 나갔다 오면 처음부터 다시 한다(건너뛰기 없음).
 * - 이용 안내는 모든 항목을 확인해야 '확인했어요'를 누를 수 있다.
 */
export default function OnboardingFlow() {
  const router = useRouter();
  const { data: me, isError } = useMyInfo();
  const [step, setStep] = useState<Step>("start");
  const [confirmed, setConfirmed] = useState<GuideValue[]>([]);

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

  const changeConfirm = (value: GuideValue, checked: boolean) =>
    setConfirmed((prev) =>
      checked ? [...new Set([...prev, value])] : prev.filter((item) => item !== value),
    );
  const allConfirmed = GUIDES.every(({ value }) => confirmed.includes(value));

  const action = {
    start: { label: "다음", onClick: () => moveTo("profile"), disabled: false },
    profile: { label: "다음", onClick: goToGuide, disabled: false },
    guide: { label: "확인했어요", onClick: finish, disabled: !allConfirmed },
    done: { label: "완료", onClick: () => router.replace("/challenges"), disabled: false },
  }[step];

  const pending = nicknameCheck.isPending || onboarding.isPending;
  const prev = PREV_STEP[step];

  return (
    <div className="bg-background-primary flex flex-1 flex-col">
      <AppHeader
        centered
        nested={prev !== undefined || step === "done"}
        // 완료 화면은 이미 저장을 마쳐 이전 단계로 되돌릴 수 없으니 홈으로 나간다.
        onBack={step === "done" ? () => router.replace("/") : prev ? () => moveTo(prev) : undefined}
        title={STEP_TITLE[step]}
      />
      <main className="flex flex-1 flex-col px-4 pt-4 pb-6">
        {step === "start" && <StartStep />}
        {step === "profile" && <ProfileStep form={form} errors={errors} onChange={updateForm} />}
        {step === "guide" && <GuideStep confirmed={confirmed} onConfirmChange={changeConfirm} />}
        {step === "done" && <DoneStep />}
      </main>
      <div className="bg-background-primary sticky bottom-0 flex flex-col gap-2 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        {onboarding.errorMessage && (
          <p role="alert" className="text-label-sm font-label-normal text-danger">
            {onboarding.errorMessage}
          </p>
        )}
        <Button fullWidth disabled={pending || !me || action.disabled} onClick={action.onClick}>
          {action.label}
        </Button>
      </div>
    </div>
  );
}
