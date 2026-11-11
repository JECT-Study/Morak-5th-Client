import type { Interest, OnboardingRequest } from "@/features/auth/types";

/** 관심 분야 선택지 (Figma 정보 입력 화면 순서) */
export const INTERESTS: { value: Interest; label: string }[] = [
  { value: "STUDY", label: "공부" },
  { value: "EXERCISE", label: "운동" },
  { value: "CAREER", label: "커리어" },
  { value: "LIFESTYLE", label: "생활습관" },
  { value: "READING", label: "독서" },
];

export type ProfileForm = {
  nickname: string;
  bio: string;
  link: string;
  interests: Interest[];
};

export type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

export const EMPTY_PROFILE: ProfileForm = { nickname: "", bio: "", link: "", interests: [] };

/** 백엔드 Nickname 규칙과 같다: 한글·영문·숫자 2~12자 */
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,12}$/;
const MAX_BIO_LENGTH = 255;
const MAX_LINK_LENGTH = 255;

/** 사용자가 https:// 없이 입력하는 경우가 많아 앞에 붙여 준다. 백엔드는 http(s) URL만 받는다. */
export const normalizeLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidLink = (value: string) => {
  try {
    const url = new URL(value);
    return url.hostname.includes(".") && value.length <= MAX_LINK_LENGTH;
  } catch {
    return false;
  }
};

/** '다음'을 누를 때 검사한다. 에러가 없으면 빈 객체 */
export function validateProfile(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  const nickname = form.nickname.trim();
  if (!nickname) errors.nickname = "닉네임을 입력해 주세요.";
  else if (!NICKNAME_PATTERN.test(nickname))
    errors.nickname = "한글·영문·숫자 2~12자로 입력해 주세요. (공백·특수문자 제외)";

  if (form.bio.trim().length > MAX_BIO_LENGTH)
    errors.bio = `${MAX_BIO_LENGTH}자 이내로 입력해 주세요.`;

  const link = normalizeLink(form.link);
  if (link && !isValidLink(link)) errors.link = "올바른 링크 주소를 입력해 주세요.";

  if (form.interests.length === 0) errors.interests = "관심 분야를 1개 이상 선택해 주세요.";
  return errors;
}

export const toOnboardingRequest = (form: ProfileForm): OnboardingRequest => ({
  nickname: form.nickname.trim(),
  bio: form.bio.trim() || null,
  profileLinkUrl: normalizeLink(form.link) || null,
  interests: form.interests,
});
