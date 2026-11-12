import { z } from "zod";

import { todayKst } from "@/shared/lib/date";

export const CHALLENGE_CATEGORIES = [
  "EXERCISE",
  "STUDY",
  "CAREER",
  "READING",
  "LIFESTYLE",
] as const;

const requiredText = (message: string, max: number) =>
  z.string().trim().min(1, message).max(max, `${max}자 이내로 입력해 주세요`);

export const challengeCreateSchema = z
  .object({
    title: requiredText("챌린지 제목을 입력해 주세요", 12),
    category: z.enum(CHALLENGE_CATEGORIES, "카테고리를 선택해 주세요."),
    description: requiredText("한줄 소개를 입력해 주세요", 50),
    mission: requiredText("미션을 입력해 주세요", 100),
    verificationMethod: requiredText("인증 방법을 입력해 주세요.", 200),
    purpose: z.string().trim().max(200, "200자 이내로 입력해 주세요."),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "시작일을 선택해 주세요")
      .refine((date) => date >= todayKst(), "오늘 이후 날짜를 선택해 주세요"),
    durationWeeks: z.number("기간을 선택해 주세요").int().min(1),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    capacity: z.number().int().max(10, "최대 10명까지 모집할 수 있어요."),
    /** 참여 포인트를 걸지 여부. 공개 챌린지에서만 걸 수 있다. */
    usePoint: z.boolean(),
    /** 1인당 참여 포인트. usePoint가 true일 때만 쓴다(1,000~5,000P, 500P 단위). */
    pointAmount: z.number().int().multipleOf(500, "500P 단위로 입력해 주세요"),
    message: z.string().trim().max(30, "30자 이내로 입력해 주세요"),
  })
  .superRefine((value, ctx) => {
    const minCapacity = value.visibility === "PUBLIC" ? 3 : 2;
    if (value.capacity < minCapacity) {
      ctx.addIssue({
        code: "custom",
        path: ["capacity"],
        message: `방장 포함 최소 ${minCapacity}명이에요`,
      });
    }
    if (value.visibility === "PRIVATE" && value.usePoint) {
      ctx.addIssue({
        code: "custom",
        path: ["usePoint"],
        message: "비공개 챌린지는 포인트를 걸 수 없어요",
      });
    }
    if (value.usePoint && (value.pointAmount < 1000 || value.pointAmount > 5000)) {
      ctx.addIssue({
        code: "custom",
        path: ["pointAmount"],
        message: "1,000~5,000P 사이로 정해 주세요",
      });
    }
  });

export type ChallengeCreateForm = z.infer<typeof challengeCreateSchema>;
