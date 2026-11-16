import { z } from "zod";

import { addDays, todayKst } from "@/shared/lib/date";

/**
 * 챌린지 최소 기간(일). 시작일과 종료일을 모두 포함해 센다.
 * 백엔드 CreateChallengeCommand: ChronoUnit.DAYS.between(startDate, endDate) < 6 이면 INVALID_PERIOD
 * ("챌린지 기간은 최소 7일이어야 합니다."). 즉 종료일 - 시작일 >= 6일.
 * 예) 1/4 시작이면 1/10부터 종료일로 고를 수 있다.
 */
export const MIN_PERIOD_DAYS = 7;

/** 시작일 기준으로 고를 수 있는 가장 빠른 종료일(시작일 + 6일) */
export const minEndDate = (startDate: string) => addDays(startDate, MIN_PERIOD_DAYS - 1);

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
    commonMission: requiredText("미션을 입력해 주세요", 100),
    verificationRules: requiredText("인증 방법을 입력해 주세요.", 200),
    purpose: z.string().trim().max(200, "200자 이내로 입력해 주세요."),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "시작일을 선택해 주세요")
      // 백엔드 INVALID_START_DATE: KST 기준 오늘보다 뒤여야 한다(내일부터).
      .refine((date) => date > todayKst(), "시작일은 내일부터 선택할 수 있어요"),
    // 시작일 기준 최소 기간은 아래 superRefine에서 검사한다.
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "종료일을 선택해 주세요"),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    capacity: z.number().int().max(10, "최대 10명까지 모집할 수 있어요."),
    /** 참여 포인트를 걸지 여부. 공개 챌린지에서만 걸 수 있다. */
    usePoint: z.boolean(),
    /** 1인당 참여 포인트. usePoint가 true일 때만 쓴다(1,000~5,000P, 500P 단위). */
    pointAmount: z.number().int().multipleOf(500, "500P 단위로 입력해 주세요"),
    message: z.string().trim().max(30, "30자 이내로 입력해 주세요"),
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate < minEndDate(value.startDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: `챌린지 기간은 최소 ${MIN_PERIOD_DAYS}일이어야 해요`,
      });
    }
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
