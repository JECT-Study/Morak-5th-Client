import { Icon, type IconName } from "@jects/jds";

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
        icon="minus"
        label={`${label} 줄이기`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      />
      <output
        aria-live="polite"
        className="text-label-lg font-label-bold text-object-boldest w-15 text-center"
      >
        {format(value)}
      </output>
      <StepButton
        icon="plus"
        label={`${label} 늘리기`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      />
    </div>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: IconName;
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
      className="bg-surface-standard border-stroke-subtle rounded-8 text-object-boldest flex size-9 items-center justify-center border transition-colors hover:bg-(--color-semantic-fill-subtlest) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <Icon name={icon} size="md" aria-hidden />
    </button>
  );
}
