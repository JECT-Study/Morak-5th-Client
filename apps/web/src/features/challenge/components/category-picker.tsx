import { CHALLENGE_CATEGORIES } from "@/features/challenge/create-schema";
import RequiredMark from "@/shared/ui/required-mark";

type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number];

/** 카테고리별 이름과 아이콘(Figma에서 내려받은 SVG, public/icons/category) */
const CATEGORY_META: Record<ChallengeCategory, { label: string; icon: string }> = {
  EXERCISE: { label: "운동", icon: "/icons/category/exercise.svg" },
  STUDY: { label: "공부", icon: "/icons/category/study.svg" },
  CAREER: { label: "커리어", icon: "/icons/category/career.svg" },
  READING: { label: "독서", icon: "/icons/category/reading.svg" },
  LIFESTYLE: { label: "생활습관", icon: "/icons/category/lifestyle.svg" },
};

type CategoryPickerProps = {
  value: ChallengeCategory | undefined;
  onChange: (value: ChallengeCategory) => void;
  /** 라디오 묶음 이름. RHF 필드 이름을 넘긴다. */
  name: string;
  required?: boolean;
  error?: string;
};

/**
 * 챌린지 카테고리 선택(Figma "카테고리 선택"). 하나만 고르는 거라 라디오로 만든다.
 * 실제 라디오 input을 숨겨 두어 방향키 이동·스크린리더 읽기는 브라우저 기본 동작을 따른다.
 * 아이콘은 Figma와 같이 SVG를 마스크로 써서 글자색(currentColor)으로 칠한다.
 */
export default function CategoryPicker({
  value,
  onChange,
  name,
  required,
  error,
}: CategoryPickerProps) {
  const errorId = `${name}-error`;

  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="text-label-sm font-label-normal text-object-neutral mb-2 flex items-start gap-0.5">
        카테고리
        {required && <RequiredMark />}
      </legend>

      <div className="flex items-start justify-between">
        {CHALLENGE_CATEGORIES.map((category) => {
          const { label, icon } = CATEGORY_META[category];
          const checked = value === category;
          return (
            <label
              key={category}
              className={`flex cursor-pointer flex-col items-center gap-1 px-0.5 pt-0.5 ${
                checked ? "text-accent-neutral" : "text-object-normal"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={category}
                checked={checked}
                required={required}
                onChange={() => onChange(category)}
                className="peer sr-only"
              />
              {/* TODO: 선택 상태 시안이 없어 강조색으로 임시 표시한다. 시안이 나오면 맞춘다. */}
              <span
                className={`rounded-8 flex size-10 items-center justify-center peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-semantic-accent-alpha-alternative) ${
                  checked ? "bg-accent-subtlest" : "bg-(--color-semantic-system-white)"
                }`}
              >
                <span
                  aria-hidden
                  className="size-6 bg-current"
                  style={{
                    maskImage: `url("${icon}")`,
                    WebkitMaskImage: `url("${icon}")`,
                    maskSize: "24px 24px",
                    WebkitMaskSize: "24px 24px",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                  }}
                />
              </span>
              <span
                className={`text-label-sm font-label-normal ${
                  checked ? "text-accent-neutral" : "text-object-neutral"
                }`}
              >
                {label}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-label-sm text-(--color-semantic-feedback-destructive-normal)"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
