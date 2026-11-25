import type { ProfileErrors, ProfileForm } from "../profile";
import ProfileFields from "./profile-fields";

type ProfileStepProps = {
  form: ProfileForm;
  errors: ProfileErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
};

/**
 * 온보딩 정보 입력(Figma "온보딩_정보입력_시안2"). 닉네임·한 줄 소개·관련 링크 → 관심 분야 칩.
 */
export default function ProfileStep({ form, errors, onChange }: ProfileStepProps) {
  return <ProfileFields form={form} errors={errors} onChange={onChange} />;
}
