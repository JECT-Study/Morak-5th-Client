"use client";

import { Checkbox } from "./checkbox";

import { cn } from "@/shared/lib/utils";

type Option<T extends string> = { value: T; label: string };

type CheckboxGroupProps<T extends string> = {
  options: readonly Option<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  /** 한 줄에 몇 개씩 놓을지. 기본 2 */
  columns?: number;
  /** true면 각 칸 테두리를 오류 색으로 */
  invalid?: boolean;
  className?: string;
};

/**
 * 여러 개를 고르는 체크박스 목록(예: 관심 분야). 각 항목은 테두리 칸 전체가 눌리는 영역이다.
 * 그룹 이름은 바깥 <fieldset><legend>로 붙인다. JDS CheckboxGroup(variant="outlined", layout="grid") 자리를 잇는다.
 */
export function CheckboxGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  invalid = false,
  className,
}: CheckboxGroupProps<T>) {
  const toggle = (option: T, checked: boolean) =>
    onChange(checked ? [...value, option] : value.filter((item) => item !== option));

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <div
            key={option.value}
            className={cn(
              "rounded-8 border px-3 py-2.5 transition-colors",
              checked ? "border-line-brand bg-surface-selected" : "border-line bg-surface-primary",
              invalid && !checked && "border-danger",
            )}
          >
            <Checkbox
              label={option.label}
              checked={checked}
              aria-invalid={invalid || undefined}
              onCheckedChange={(next) => toggle(option.value, next === true)}
            />
          </div>
        );
      })}
    </div>
  );
}
