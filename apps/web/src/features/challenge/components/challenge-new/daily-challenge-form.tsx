"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BlockButton } from "@jects/jds";
import { Controller, useForm } from "react-hook-form";

import {
  type ChallengeCreateForm,
  challengeCreateSchema,
} from "@/features/challenge/create-schema";
import FormTextField from "@/shared/ui/form-text-field";
import FormTextarea from "@/shared/ui/form-textarea";
import CategoryPicker from "../category-picker";
import RecruitmentSection from "../recruitment/recruitment-section";
import ScheduleSection from "../schedule-section";

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
      usePoint: false,
      pointAmount: 1000,
    },
  });

  // TODO: 챌린지 개설 API가 나오면 요청을 보낸다.
  const onSubmit = (values: ChallengeCreateForm) => {
    console.info("챌린지 만들기", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormTextField
        label="챌린지 제목"
        required
        error={errors.title?.message}
        maxLength={12}
        placeholder="챌린지 제목을 입력해 주세요"
        {...register("title")}
      />

      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <CategoryPicker
            name={field.name}
            required
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <FormTextField
        label="한줄 소개"
        required
        error={errors.description?.message}
        maxLength={50}
        placeholder="챌린지를 한 줄로 소개해 주세요"
        {...register("description")}
      />

      <FormTextField
        label="미션"
        required
        error={errors.mission?.message}
        maxLength={100}
        placeholder="매일 수행할 미션을 입력해 주세요"
        {...register("mission")}
      />

      <FormTextField
        label="인증 방법"
        required
        error={errors.verificationMethod?.message}
        maxLength={200}
        placeholder="인증 방법을 입력해 주세요"
        {...register("verificationMethod")}
      />

      <FormTextField
        label="주요 목적 (선택)"
        error={errors.purpose?.message}
        maxLength={200}
        placeholder="챌린지의 목표나 목적을 입력해주세요"
        {...register("purpose")}
      />

      {/* 직접 만든 입력이라 register 대신 Controller로 RHF 값과 연결한다. */}

      <ScheduleSection control={control} />
      <RecruitmentSection control={control} />

      <FormTextarea
        label="함께할 사람들에게 한 마디 (선택)"
        error={errors.message?.message}
        maxLength={30}
        rows={3}
        placeholder="예: 아침형 인간이 되고 싶은 기획자"
        {...register("message")}
      />
      <BlockButton type="submit" size="lg" hierarchy="accent">
        챌린지 생성하기
      </BlockButton>
    </form>
  );
}
