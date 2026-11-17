import type { Interest } from "@/features/auth/types";
import { Chip } from "@/shared/ui/chip";
import RequiredMark, { OptionalMark } from "@/shared/ui/required-mark";
import { TextField } from "@/shared/ui/text-field";

import { INTERESTS, type ProfileErrors, type ProfileForm } from "../profile";

type ProfileStepProps = {
  form: ProfileForm;
  errors: ProfileErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
};

/**
 * 온보딩 정보 입력(Figma "온보딩_정보입력"). 환영 영역 → 닉네임·한 줄 소개·관련 링크 → 관심 분야 칩.
 * 입력칸 모양은 아직 시안이 확정되지 않아 공통 TextField를 그대로 쓴다.
 */
export default function ProfileStep({ form, errors, onChange }: ProfileStepProps) {
  const toggleInterest = (value: Interest) =>
    onChange({
      interests: form.interests.includes(value)
        ? form.interests.filter((item) => item !== value)
        : [...form.interests, value],
    });

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

      <TextField status={errors.nickname ? "error" : "default"} required>
        <TextField.Label>닉네임</TextField.Label>
        <TextField.Input
          value={form.nickname}
          onChange={(event) => onChange({ nickname: event.target.value })}
          maxLength={12}
          counter
          autoComplete="nickname"
          placeholder="닉네임을 입력해 주세요"
        />
        {errors.nickname && (
          <TextField.Footer>
            <TextField.Helper>{errors.nickname}</TextField.Helper>
          </TextField.Footer>
        )}
      </TextField>

      <TextField status={errors.bio ? "error" : "default"} optional>
        <TextField.Label>한 줄 소개</TextField.Label>
        <TextField.Textarea
          value={form.bio}
          onChange={(event) => onChange({ bio: event.target.value })}
          maxLength={30}
          counter
          rows={1}
          placeholder="나를 한 줄로 소개해 주세요"
        />
        {errors.bio && (
          <TextField.Footer>
            <TextField.Helper>{errors.bio}</TextField.Helper>
          </TextField.Footer>
        )}
      </TextField>

      <TextField status={errors.link ? "error" : "default"} optional>
        <TextField.Label>관련 링크</TextField.Label>
        <TextField.Input
          type="url"
          inputMode="url"
          value={form.link}
          onChange={(event) => onChange({ link: event.target.value })}
          maxLength={255}
          placeholder="개인 웹사이트 또는 블로그 주소"
        />
        {errors.link && (
          <TextField.Footer>
            <TextField.Helper>{errors.link}</TextField.Helper>
          </TextField.Footer>
        )}
      </TextField>

      {/*
        칩은 켜고 끄는 버튼이라 묶음 이름이 필요하다. fieldset/legend는 legend가 flex 배치에 끼지 않아
        간격이 어긋나서, 같은 뜻인 role="group" + aria-labelledby로 묶는다.
      */}
      <div
        role="group"
        aria-labelledby="interests-label"
        aria-describedby={errors.interests ? "interests-error" : "interests-description"}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <p
            id="interests-label"
            className="text-label-md font-label-normal text-fg-primary flex items-center gap-1"
          >
            관심 분야
            <RequiredMark>최소 1개 필수</RequiredMark>
            <OptionalMark>/ 복수 선택</OptionalMark>
          </p>
          <p id="interests-description" className="text-body-sm font-body-normal text-fg-secondary">
            관심 있는 도전 주제를 골라 주세요
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(({ value, label }) => (
            <Chip
              key={value}
              selected={form.interests.includes(value)}
              onClick={() => toggleInterest(value)}
            >
              {label}
            </Chip>
          ))}
        </div>
        {errors.interests && (
          <p
            id="interests-error"
            role="alert"
            className="text-label-sm font-label-normal text-danger"
          >
            {errors.interests}
          </p>
        )}
      </div>
    </div>
  );
}
