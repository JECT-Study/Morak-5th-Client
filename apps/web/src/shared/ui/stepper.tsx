import { Minus, Plus, type LucideIcon } from "lucide-react";

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** 한 번 누를 때 바뀌는 양. 기본 1 */
  step?: number;
  /** 가운데에 보여줄 글자. 예) (v) => `${v}명` */
  format?: (value: number) => string;
  /** 무엇을 조절하는지. 버튼 이름("함께 할 인원 줄이기")에 쓴다. */
  label: string;
};

/**
 * − 값 + 로 숫자를 한 단계씩 바꾸는 스테퍼(Figma "stepper").
 * 최솟값·최댓값에 닿으면 해당 버튼을 끈다. 값이 바뀌면 스크린리더가 새 값을 읽는다.
 */
export default function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  format = String,
  label,
}: StepperProps) {
  return (
    <div className="flex items-center gap-3">
      <StepButton
        icon={Minus}
        label={`${label} 줄이기`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      />
      <output
        aria-live="polite"
        className="text-label-lg font-label-strong text-fg-primary w-15 text-center"
      >
        {format(value)}
      </output>
      <StepButton
        icon={Plus}
        label={`${label} 늘리기`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      />
    </div>
  );
}

function StepButton({
  icon: StepIcon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="bg-surface-primary border-line rounded-8 text-fg-primary hover:bg-surface-secondary active:bg-surface-secondary-pressed focus-visible:ring-line-focus disabled:border-line-disabled disabled:text-fg-disabled flex size-9 items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      <StepIcon aria-hidden className="size-5" />
    </button>
  );
}
