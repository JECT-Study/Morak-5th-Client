"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BlockButton, TextField } from "@jects/jds";
import { Controller, useForm, type FieldError } from "react-hook-form";

import {
  type ChallengeCreateForm,
  challengeCreateSchema,
} from "@/features/challenge/create-schema";
import DateField from "@/shared/ui/date-field";

/** 에러가 있으면 입력 아래에 메시지를 보여준다 */
const FieldErrorText = ({ error }: { error?: FieldError }) =>
  error ? (
    <TextField.Footer>
      <TextField.Helper>{error.message}</TextField.Helper>
    </TextField.Footer>
  ) : null;

export default function DailyChallengeForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChallengeCreateForm>({
    resolver: zodResolver(challengeCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      mission: "",
      verificationMethod: "",
      purpose: "",
      message: "",
      startDate: "",
      visibility: "PUBLIC",
      capacity: 3,
      pointAmount: 0,
    },
  });

  // TODO: 챌린지 개설 API가 나오면 요청을 보낸다.
  const onSubmit = (values: ChallengeCreateForm) => {
    console.info("챌린지 만들기", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TextField required status={errors.title ? "error" : "default"}>
        <TextField.Label>챌린지 제목</TextField.Label>
        <TextField.Input
          {...register("title")}
          maxLength={12}
          placeholder="챌린지 제목을 입력해 주세요"
        />
        <FieldErrorText error={errors.title} />
      </TextField>

      <TextField required status={errors.description ? "error" : "default"}>
        <TextField.Label>한줄 소개</TextField.Label>
        <TextField.Input
          {...register("description")}
          maxLength={50}
          placeholder="챌린지를 한 줄로 소개해 주세요"
        />
        <FieldErrorText error={errors.description} />
      </TextField>

      <TextField required status={errors.mission ? "error" : "default"}>
        <TextField.Label>미션</TextField.Label>
        <TextField.Input
          {...register("mission")}
          maxLength={100}
          placeholder="매일 수행할 미션을 입력해 주세요"
        />
        <FieldErrorText error={errors.mission} />
      </TextField>

      <TextField required status={errors.verificationMethod ? "error" : "default"}>
        <TextField.Label>인증 방법</TextField.Label>
        <TextField.Input
          {...register("verificationMethod")}
          maxLength={200}
          placeholder="인증 방법을 입력해 주세요"
        />
        <FieldErrorText error={errors.verificationMethod} />
      </TextField>

      <TextField status={errors.purpose ? "error" : "default"}>
        <TextField.Label>주요 목적 (선택)</TextField.Label>
        <TextField.Input
          {...register("purpose")}
          maxLength={200}
          placeholder="챌린지의 목표나 목적을 입력해주세요"
        />
        <FieldErrorText error={errors.purpose} />
      </TextField>

      {/* 직접 만든 입력이라 register 대신 Controller로 RHF 값과 연결한다. */}
      <Controller
        name="startDate"
        control={control}
        render={({ field, fieldState }) => (
          <DateField
            label="시작일"
            required
            value={field.value}
            onChange={field.onChange}
            disablePast
            error={fieldState.error?.message}
          />
        )}
      />

      <BlockButton type="submit" size="lg" hierarchy="accent">
        챌린지 생성하기
      </BlockButton>
    </form>
  );
}
