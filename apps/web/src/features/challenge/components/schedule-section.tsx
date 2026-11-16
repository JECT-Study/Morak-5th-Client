import DateField from "@/shared/ui/date-field";
import { Control, Controller, useWatch } from "react-hook-form";
import { ChallengeCreateForm, MIN_PERIOD_DAYS, minEndDate } from "../create-schema";
import FormCard from "./form-card";

export default function ScheduleSection({ control }: { control: Control<ChallengeCreateForm> }) {
  // 종료일 달력은 시작일에 따라 고를 수 있는 날짜가 달라진다.
  const startDate = useWatch({ control, name: "startDate" });

  return (
    <FormCard title="진행 일정">
      {/* items-start: 한쪽에만 에러 문구가 생겨도 다른 칸이 같이 늘어나지 않게 */}
      <div className="flex items-start gap-2">
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <DateField
              ref={field.ref}
              label="시작일"
              required
              value={field.value}
              onChange={field.onChange}
              // 백엔드는 KST 기준 내일부터 시작할 수 있다.
              minDaysFromToday={1}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <DateField
              ref={field.ref}
              label="종료일"
              required
              value={field.value}
              onChange={field.onChange}
              // 시작일을 고르기 전에는 가장 빠른 시작일(내일) 기준. 내일 + (7 - 1)일 = 오늘 + 7일
              minDaysFromToday={MIN_PERIOD_DAYS}
              minDate={startDate ? minEndDate(startDate) : undefined}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>
    </FormCard>
  );
}
