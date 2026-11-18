import { todayKst } from "@/shared/lib/date";

import { countDays, formatDDay, formatPeriod, getRemainingDays } from "../../utils";

type ChallengeProgressProps = {
  /** 1부터 시작하는 현재 일차. 시작 전이면 null */
  currentDay: number | null;
  totalDays: number;
  startDate: string;
  endDate: string;
};

/** "2026-10-26" → "10월 26일" */
const toMonthDay = (date: string) => {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
};

/**
 * 진행 현황: 현재 일차, 기간과 D-day, 진행 막대.
 * 시작 전이면 일차 자리에 시작까지 남은 D-n과 시작일을 보여 주고 막대는 0%다.
 */
export default function ChallengeProgress({
  currentDay,
  totalDays,
  startDate,
  endDate,
}: ChallengeProgressProps) {
  const started = currentDay !== null;
  const progress = started ? Math.min(currentDay / totalDays, 1) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end justify-between px-1">
        <p className="flex items-end gap-1">
          <span className="text-title-5 font-title text-fg-brand-strong">
            {started ? currentDay : formatDDay(Math.max(countDays(todayKst(), startDate) - 1, 0))}
          </span>
          <span className="text-label-lg font-label-normal text-fg-secondary pb-2">
            {started ? "일차" : `${toMonthDay(startDate)} 시작`} / {totalDays}일
          </span>
        </p>
        <p className="text-label-xs font-label-normal text-fg-tertiary flex flex-col items-end pb-1">
          <span>{formatPeriod(startDate, endDate)}</span>
          {started && <span>{formatDDay(getRemainingDays(currentDay, totalDays))}</span>}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="챌린지 진행률"
        aria-valuemin={0}
        aria-valuemax={totalDays}
        aria-valuenow={currentDay ?? 0}
        className="bg-surface-tertiary h-3 overflow-hidden rounded-full"
      >
        <div
          className="bg-surface-brand h-full rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
