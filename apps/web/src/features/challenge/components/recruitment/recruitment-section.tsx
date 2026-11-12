import { Divider, SegmentedControls } from "@jects/jds";
import { useController, type Control } from "react-hook-form";

import type { ChallengeCreateForm } from "@/features/challenge/create-schema";
import Stepper from "@/shared/ui/stepper";

import FormCard from "../form-card";
import ConditionRow from "./condition-row";

/** 모집 정원(방장 포함). 공개 3~10명, 비공개 2~10명 (프론트 위키 5.6) */
const MAX_CAPACITY = 10;
const MIN_CAPACITY = { PUBLIC: 3, PRIVATE: 2 } as const;

/** 1인당 참여 포인트. 1,000~5,000P, 500P 단위 */
const POINT = { min: 1000, max: 5000, step: 500 } as const;

const VISIBILITY_DESCRIPTION = {
  PUBLIC: "누구나 챌린지를 찾아 참여 신청할 수 있어요.",
  // TODO: 비공개 설명 문구는 시안에 없어 임시로 넣었다. 디자인 확인 후 맞춘다.
  PRIVATE: "초대 링크나 코드로만 참여 신청할 수 있어요.",
} as const;

const formatPoint = (value: number) => `${value.toLocaleString("ko-KR")}P`;

type RecruitmentSectionProps = {
  control: Control<ChallengeCreateForm>;
};

/**
 * 모집 조건(Figma "모집 조건"): 공개 여부, 함께 할 인원, 참여 포인트 사용, 1인당 참여 포인트.
 * 공개 여부에 따라 다른 값이 바뀌어서 네 필드를 이 컴포넌트에서 함께 다룬다.
 * - 비공개: 정원 최소 2명, 참여 포인트 영역을 숨기고 포인트를 끈다.
 * - 공개: 정원 최소 3명. 2명이었다면 3명으로 올린다.
 */
export default function RecruitmentSection({ control }: RecruitmentSectionProps) {
  const visibility = useController({ control, name: "visibility" });
  const capacity = useController({ control, name: "capacity" });
  const usePoint = useController({ control, name: "usePoint" });
  const pointAmount = useController({ control, name: "pointAmount" });

  const isPublic = visibility.field.value === "PUBLIC";
  const minCapacity = MIN_CAPACITY[visibility.field.value];

  const changeVisibility = (next: ChallengeCreateForm["visibility"]) => {
    visibility.field.onChange(next);
    if (next === "PRIVATE") usePoint.field.onChange(false);
    if (capacity.field.value < MIN_CAPACITY[next]) capacity.field.onChange(MIN_CAPACITY[next]);
  };

  const changeUsePoint = (on: boolean) => {
    usePoint.field.onChange(on);
    if (on && pointAmount.field.value < POINT.min) pointAmount.field.onChange(POINT.min);
  };

  return (
    <FormCard title="모집 조건">
      <ConditionRow
        id="visibility"
        label="공개 여부"
        required
        description={VISIBILITY_DESCRIPTION[visibility.field.value]}
      >
        <SegmentedControls.Root
          size="xs"
          aria-labelledby="visibility-label"
          aria-describedby="visibility-description"
          value={visibility.field.value}
          onValueChange={(value) => changeVisibility(value as ChallengeCreateForm["visibility"])}
          className="w-[102px]"
        >
          <SegmentedControls.Item value="PUBLIC">공개</SegmentedControls.Item>
          <SegmentedControls.Item value="PRIVATE">비공개</SegmentedControls.Item>
        </SegmentedControls.Root>
      </ConditionRow>

      <Divider />

      <ConditionRow
        id="capacity"
        label="함께 할 인원"
        required
        description={`방장 포함 최소 ${minCapacity}명`}
        error={capacity.fieldState.error?.message}
      >
        <Stepper
          label="함께 할 인원"
          value={capacity.field.value}
          onChange={capacity.field.onChange}
          min={minCapacity}
          max={MAX_CAPACITY}
          format={(value) => `${value}명`}
        />
      </ConditionRow>

      {/* 참여 포인트는 공개 챌린지에서만 걸 수 있다. */}
      {isPublic && (
        <>
          <Divider />
          <ConditionRow
            id="use-point"
            label="참여 포인트"
            required
            description="포인트를 걸면 챌린지 결과에 따라 돌려받아요."
            error={usePoint.fieldState.error?.message}
          >
            <SegmentedControls.Root
              size="xs"
              aria-labelledby="use-point-label"
              aria-describedby="use-point-description"
              value={usePoint.field.value ? "ON" : "OFF"}
              onValueChange={(value) => changeUsePoint(value === "ON")}
              className="w-[102px]"
            >
              <SegmentedControls.Item value="ON">ON</SegmentedControls.Item>
              <SegmentedControls.Item value="OFF">OFF</SegmentedControls.Item>
            </SegmentedControls.Root>
          </ConditionRow>

          {usePoint.field.value && (
            <>
              <Divider />
              <ConditionRow
                id="point-amount"
                label="1인당 참여 포인트"
                required
                description="1,000 ~ 5,000P (500P 단위)"
                error={pointAmount.fieldState.error?.message}
              >
                <Stepper
                  label="1인당 참여 포인트"
                  value={pointAmount.field.value}
                  onChange={pointAmount.field.onChange}
                  min={POINT.min}
                  max={POINT.max}
                  step={POINT.step}
                  format={formatPoint}
                />
              </ConditionRow>
            </>
          )}
        </>
      )}
    </FormCard>
  );
}
