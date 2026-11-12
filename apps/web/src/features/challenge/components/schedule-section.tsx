import DateField from "@/shared/ui/date-field";
import { SelectField, type SelectOption } from "@jects/jds";
import { Control, Controller } from "react-hook-form";
import { ChallengeCreateForm } from "../create-schema";
import FormCard from "./form-card";

// TODO: 기간 선택지는 기획 확인 필요. 백엔드 duration_weeks(주 단위) 기준 임시 값
const DURATION_OPTIONS: SelectOption[] = [
  { value: "1", label: "1주" },
  { value: "2", label: "2주" },
  { value: "3", label: "3주" },
  { value: "4", label: "4주" },
];

export default function ScheduleSection({ control }: { control: Control<ChallengeCreateForm> }) {
  return (
    <FormCard title="진행 일정">
      {/* items-start: 한쪽에만 에러 문구가 생겨도 다른 칸이 같이 늘어나지 않게 */}
      <div className="flex items-start gap-2">
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
        <Controller
          name="durationWeeks"
          control={control}
          render={({ field, fieldState }) => (
            <SelectField
              required
              status={fieldState.error ? "error" : "default"}
              className="min-w-0 flex-1"
            >
              <SelectField.Label>기간</SelectField.Label>
              <SelectField.Input
                options={DURATION_OPTIONS}
                // SelectField 값은 문자열이고 폼 값(durationWeeks)은 숫자라 서로 바꿔 준다.
                value={field.value ? String(field.value) : null}
                onChange={(value) => field.onChange(Number(value))}
                onBlur={field.onBlur}
                placeholder="기간을 선택해주세요"
              />
              {fieldState.error && (
                <SelectField.Helper>{fieldState.error.message}</SelectField.Helper>
              )}
            </SelectField>
          )}
        />
      </div>
    </FormCard>
  );
}
