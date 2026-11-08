"use client";

import { BlockButton } from "@jects/jds";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthApiError, checkNickname, completeOnboarding } from "@/features/auth/onboarding-api";
import { useMyInfo } from "@/features/auth/use-my-info";
import AppHeader from "@/shared/layout/app-header";

import {
  EMPTY_PROFILE,
  toOnboardingRequest,
  validateProfile,
  type ProfileErrors,
  type ProfileForm,
} from "../profile";
import DoneStep from "./done-step";
import GuideStep from "./guide-step";
import ProfileStep from "./profile-step";

type Step = "profile" | "guide" | "done";

const STEP_TITLE: Record<Step, string> = {
  profile: "모락 시작하기",
  guide: "모락 이용 안내",
  done: "준비 완료",
};

const NICKNAME_TAKEN = "이미 사용 중인 닉네임이에요.";

/**
 * 온보딩 3화면(정보 입력 → 이용 안내 → 준비 완료). 화면 정의서 "온보딩_화면정의서".
 * - 약관 동의 전이면 로그인 화면의 약관 시트로, 이미 온보딩을 마쳤으면 홈으로 보낸다.
 * - 입력값은 이 화면 안에서만 들고 있다가 '확인했어요'에서 한 번에 저장한다.
 *   중간에 나갔다 오면 정보 입력부터 다시 한다(건너뛰기 없음).
 */
export default function OnboardingFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me, isError } = useMyInfo();
  const [step, setStep] = useState<Step>("profile");
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 완료 화면에서는 내 정보가 onboarded로 바뀌므로 검사하지 않는다.
  useEffect(() => {
    if (step === "done") return;
    if (isError) router.replace("/login");
    else if (me?.onboarded) router.replace("/");
    else if (me && !me.termsAgreed) router.replace("/login?step=terms");
  }, [me, isError, step, router]);

  // 가입할 때 받은 닉네임(카카오 등)이 있으면 채워 두고 확인·수정하게 한다.
  const [prefilled, setPrefilled] = useState(false);
  if (me && !prefilled) {
    setPrefilled(true);
    if (me.nickname) setForm((prev) => ({ ...prev, nickname: me.nickname ?? "" }));
  }

  const updateForm = (patch: Partial<ProfileForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    // 고친 항목의 에러는 지운다.
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof ProfileForm)[]) delete next[key];
      return next;
    });
  };

  const goToGuide = async () => {
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const { available } = await checkNickname(form.nickname.trim());
      if (!available) {
        setErrors({ nickname: NICKNAME_TAKEN });
        return;
      }
      setStep("guide");
      window.scrollTo(0, 0);
    } catch {
      setErrors({ nickname: "닉네임을 확인하지 못했어요. 다시 시도해 주세요." });
    } finally {
      setPending(false);
    }
  };

  const finish = async () => {
    setPending(true);
    setSubmitError(null);
    try {
      const updated = await completeOnboarding(toOnboardingRequest(form));
      queryClient.setQueryData(["users", "me"], updated);
      setStep("done");
      window.scrollTo(0, 0);
    } catch (cause) {
      const code = cause instanceof AuthApiError ? cause.code : null;
      if (code === "USER_004") {
        setErrors({ nickname: NICKNAME_TAKEN });
        setStep("profile");
      } else if (code === "USER_003") {
        router.replace("/");
      } else if (code === "USER_002") {
        router.replace("/login?step=terms");
      } else {
        setSubmitError("저장하지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      setPending(false);
    }
  };

  const action = {
    profile: { label: "다음", onClick: () => void goToGuide() },
    guide: { label: "확인했어요", onClick: () => void finish() },
    done: { label: "완료", onClick: () => router.replace("/challenges") },
  }[step];

  return (
    <>
      <AppHeader title={STEP_TITLE[step]} />
      <main className="flex flex-1 flex-col px-6 pt-4 pb-6">
        {step === "profile" && <ProfileStep form={form} errors={errors} onChange={updateForm} />}
        {step === "guide" && <GuideStep />}
        {step === "done" && <DoneStep />}
      </main>
      <div className="bg-page border-stroke-subtler sticky bottom-0 flex flex-col gap-2 border-t px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {submitError && (
          <p role="alert" className="text-label-sm text-(--color-semantic-feedback-destructive)">
            {submitError}
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
