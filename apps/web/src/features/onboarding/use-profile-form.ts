import { useState } from "react";

import { EMPTY_PROFILE, validateProfile, type ProfileErrors, type ProfileForm } from "./profile";

/**
 * 온보딩 정보 입력 폼의 값·에러.
 * @param prefillNickname 가입할 때 받은 닉네임(카카오 등). 처음 한 번만 채워 두고 확인·수정하게 한다.
 * @param initialForm 처음 채워 둘 값. 마이페이지 정보 수정은 지금 프로필 값으로 시작한다.
 */
export function useProfileForm(
  prefillNickname: string | null | undefined,
  initialForm: ProfileForm = EMPTY_PROFILE,
) {
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [errors, setErrors] = useState<ProfileErrors>({});

  // 내 정보가 늦게 도착해도 한 번만 채운다(렌더 중 상태 조정 패턴).
  const [prefilled, setPrefilled] = useState(false);
  if (prefillNickname !== undefined && !prefilled) {
    setPrefilled(true);
    if (prefillNickname) setForm((prev) => ({ ...prev, nickname: prefillNickname }));
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

  /** 입력값을 검사해 에러를 표시한다. 통과하면 true */
  const validate = () => {
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /** 서버 검사 결과 등으로 특정 항목에 에러를 띄운다. */
  const setFieldError = (field: keyof ProfileForm, message: string) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  return { form, errors, updateForm, validate, setFieldError };
}
