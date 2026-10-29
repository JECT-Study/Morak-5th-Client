import { formatDDay, formatPeriod, getRemainingDays } from "../../utils";

type ChallengeProgressProps = {
  currentDay: number;
  totalDays: number;
  startDate: string;
  endDate: string;
};

/** 진행 현황: 현재 일차, 기간과 D-day, 진행 막대 */
export default function ChallengeProgress({
  currentDay,
  totalDays,
  startDate,
  endDate,
}: ChallengeProgressProps) {
  const progress = Math.min(currentDay / totalDays, 1);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end justify-between px-1">
        <p className="flex items-end gap-1">
          <span className="text-title-5 font-title-bold text-lime-assistive">{currentDay}</span>
          <span className="text-label-lg font-label-normal text-object-neutral pb-2">
            일차 / {totalDays}일
          </span>
        </p>
        <p className="text-label-xs font-label-normal text-object-alternative flex flex-col items-end pb-1">
          <span>{formatPeriod(startDate, endDate)}</span>
          <span>{formatDDay(getRemainingDays(currentDay, totalDays))}</span>
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="챌린지 진행률"
        aria-valuemin={0}
        aria-valuemax={totalDays}
        aria-valuenow={currentDay}
        className="bg-surface-deeper h-3 overflow-hidden rounded-full"
      >
        <div
          className="bg-lime-subtler h-full rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
