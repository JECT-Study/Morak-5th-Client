import type { ProfileErrors, ProfileForm } from "../profile";
import ProfileFields from "./profile-fields";

type ProfileStepProps = {
  form: ProfileForm;
  errors: ProfileErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
};

/**
 * 온보딩 정보 입력(Figma "온보딩_정보입력"). 환영 영역 → 닉네임·한 줄 소개·관련 링크 → 관심 분야 칩.
 */
export default function ProfileStep({ form, errors, onChange }: ProfileStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* TODO: 프로필 사진 자리. Figma도 빈 칸이라 무엇을 넣을지 정해지면 바꾼다. */}
        <div aria-hidden className="bg-surface-secondary rounded-16 size-28 opacity-80" />
        <div className="flex flex-col gap-1">
          <h2 className="text-title-3 font-title text-fg-primary">모락에 오신 것을 환영해요!</h2>
          <p className="text-body-md font-body-normal text-fg-secondary">
            함께 도전할 준비를 해볼까요?
          </p>
        </div>
      </div>

      <ProfileFields form={form} errors={errors} onChange={onChange} />
    </div>
  );
}
