import { CheckboxGroup, TextField, Textarea } from "@jects/jds";
import Image from "next/image";

import type { Interest } from "@/features/auth/types";

import { INTERESTS, type ProfileErrors, type ProfileForm } from "../profile";

type ProfileStepProps = {
  form: ProfileForm;
  errors: ProfileErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
};

/** 온보딩 1단계: 정보 입력 (화면 정의서 "모락 시작하기"). 프로필 사진은 마이페이지에서 받는다. */
export default function ProfileStep({ form, errors, onChange }: ProfileStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image src="/images/morak-character.svg" alt="" width={96} height={92} priority />
        <h2 className="text-title-1 font-title-subtle text-object-boldest">
          모락에 오신 것을 환영해요!
        </h2>
        <p className="text-label-md font-label-subtle text-object-neutral">
          함께 도전할 준비를 해볼까요?
        </p>
      </div>

      <TextField status={errors.nickname ? "error" : "default"} required>
        <TextField.Label>닉네임</TextField.Label>
        <TextField.Input
          value={form.nickname}
          onChange={(event) => onChange({ nickname: event.target.value })}
          maxLength={12}
          autoComplete="nickname"
          placeholder="닉네임을 입력해 주세요"
        />
        <TextField.Footer>
          <TextField.Helper>{errors.nickname ?? "한글·영문·숫자 2~12자"}</TextField.Helper>
          <TextField.Counter />
        </TextField.Footer>
      </TextField>

      <Textarea status={errors.bio ? "error" : "default"}>
        <Textarea.Label>한 줄 소개</Textarea.Label>
        <Textarea.Control
          value={form.bio}
          onChange={(event) => onChange({ bio: event.target.value })}
          maxLength={255}
          rows={2}
          placeholder="팀원에게 나를 소개해 주세요"
        />
        {errors.bio && (
          <Textarea.Footer>
            <Textarea.Helper>{errors.bio}</Textarea.Helper>
          </Textarea.Footer>
        )}
      </Textarea>

      <TextField status={errors.link ? "error" : "default"}>
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

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label-md font-label-bold text-object-bolder">
          관심 분야
          <span className="text-label-sm font-label-subtle text-object-alternative ml-1">
            최소 1개 / 복수 선택
          </span>
        </legend>
        <p className="text-label-sm font-label-subtle text-object-alternative">
          관심 있는 도전 주제를 골라 주세요.
        </p>
        <CheckboxGroup
          aria-label="관심 분야"
          layout="grid"
          columns={2}
          variant="outlined"
          stretched
          isInvalid={Boolean(errors.interests)}
          options={INTERESTS}
          value={form.interests}
          onChange={(value) => onChange({ interests: value as Interest[] })}
        />
        {errors.interests && (
          <p role="alert" className="text-label-sm text-(--color-semantic-feedback-destructive)">
            {errors.interests}
          </p>
        )}
      </fieldset>
    </div>
  );
}
