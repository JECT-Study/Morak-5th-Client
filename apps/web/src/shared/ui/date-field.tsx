"use client";

import { CalendarDays } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type RefCallback } from "react";

import { addDays, fromDateString, toDateString, todayKst } from "@/shared/lib/date";
import BottomSheet from "@/shared/ui/bottom-sheet";
import { Calendar } from "@/shared/ui/calendar";
import { TextField } from "@/shared/ui/text-field";

type DateFieldProps = {
  label: string;
  /** "YYYY-MM-DD". 선택 전이면 빈 문자열 */
  value: string;
  onChange: (value: string) => void;
  /** 오늘(KST)부터 며칠 뒤부터 고를 수 있는지. 0이면 오늘부터, 1이면 내일부터. 없으면 제한 없음 */
  minDaysFromToday?: number;
  /** 이 날짜("YYYY-MM-DD")부터 고를 수 있다. minDaysFromToday와 같이 주면 더 늦은 쪽을 따른다 */
  minDate?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  /** 입력칸 ref. RHF Controller의 field.ref를 넘기면 검증 실패 시 이 칸으로 포커스가 간다. */
  ref?: RefCallback<HTMLInputElement>;
};

/**
 * 날짜 입력칸(Figma "🔨 Date field"). TextField와 Calendar를 조합한다.
 * 칸을 누르면 아래 시트에 달력이 열리고, 날짜를 고르면 닫힌다.
 * readOnly 대신 직접 입력만 막는다(readOnly면 스크린리더가 "읽기 전용"으로 읽어 고를 수 없는 칸처럼 들린다).
 */
export default function DateField({
  label,
  value,
  onChange,
  minDaysFromToday,
  minDate,
  required,
  error,
  placeholder = "YYYY.MM.DD",
  ref,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  // 시트를 닫으면 포커스를 이 입력칸으로 돌려준다. 바깥에서 받은 ref(RHF field.ref)에도 같이 넘긴다.
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    ref?.(node);
  };

  // 글자 입력은 막고, Enter·Space로는 달력을 연다. Tab 이동은 그대로 둔다.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") return;
    event.preventDefault();
    if (event.key === "Enter" || event.key === " ") setOpen(true);
  };

  return (
    <>
      <TextField
        required={required}
        status={error ? "error" : "default"}
        className="min-w-0 flex-1"
      >
        <TextField.Label>{label}</TextField.Label>
        <TextField.Input
          ref={setInputRef}
          value={value.replaceAll("-", ".")}
          onChange={() => undefined}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          inputMode="none"
          autoComplete="off"
          aria-haspopup="dialog"
          placeholder={placeholder}
          suffix={<CalendarDays aria-hidden />}
          className="cursor-pointer caret-transparent"
        />
        {error && (
          <TextField.Footer>
            <TextField.Helper>{error}</TextField.Helper>
          </TextField.Footer>
        )}
      </TextField>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        // 트리거 없이 setOpen으로 열어서, 닫을 때 돌아갈 곳을 직접 정한다(Esc·끌어내리기·날짜 선택 모두).
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DateCalendar
          value={value}
          minDaysFromToday={minDaysFromToday}
          minDate={minDate}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      </BottomSheet>
    </>
  );
}

/**
 * 시트가 열릴 때만 그려지므로 오늘 날짜를 여기서 구한다.
 * cacheComponents에서는 렌더링 중 new Date()가 미리 렌더링(prerender) 값으로 굳을 수 있어 화면 밖에서 계산하지 않는다.
 */
function DateCalendar({
  value,
  minDaysFromToday,
  minDate,
  onSelect,
}: {
  value: string;
  minDaysFromToday?: number;
  minDate?: string;
  onSelect: (value: string) => void;
}) {
  const fromToday =
    minDaysFromToday === undefined ? undefined : addDays(todayKst(), minDaysFromToday);
  // "YYYY-MM-DD"는 문자열 비교가 날짜 비교와 같다. 둘 다 있으면 더 늦은 날짜가 최소값이다.
  const min = [fromToday, minDate]
    .filter((date) => date !== undefined)
    .sort()
    .at(-1);
  const selected = value ? fromDateString(value) : undefined;
  return (
    <Calendar
      className="self-center"
      mode="single"
      // 고른 날을 다시 눌러도 선택이 풀리지 않게 한다(날짜 칸은 비울 수 없다).
      required
      selected={selected}
      // 고른 날이 있으면 그 달을, 없으면 고를 수 있는 첫 달을 먼저 보여 준다.
      defaultMonth={selected ?? (min ? fromDateString(min) : undefined)}
      disabled={min ? (date: Date) => toDateString(date) < min : undefined}
      onSelect={(date) => onSelect(toDateString(date))}
    />
  );
}
