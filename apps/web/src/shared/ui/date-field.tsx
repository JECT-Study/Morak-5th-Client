"use client";

import { DatePicker, Icon, TextField } from "@jects/jds";
import { Dialog } from "radix-ui";
import { useState, type KeyboardEvent } from "react";

import { fromDateString, toDateString, todayKst } from "@/shared/lib/date";

type DateFieldProps = {
  label: string;
  /** "YYYY-MM-DD". 선택 전이면 빈 문자열 */
  value: string;
  onChange: (value: string) => void;
  /** true면 오늘(KST) 이전 날짜는 고를 수 없다 */
  disablePast?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
};

/**
 * 날짜 입력칸(Figma "🔨 Date field"). JDS에 DateField가 없어 TextField와 DatePicker를 조합한다.
 * 칸을 누르면 아래 시트에 달력이 열리고, 날짜를 고르면 닫힌다.
 * readOnly를 주면 JDS가 읽기 전용 모양(회색, placeholder 숨김)으로 그려서, 대신 직접 입력만 막는다.
 */
export default function DateField({
  label,
  value,
  onChange,
  disablePast,
  required,
  error,
  placeholder = "YYYY.MM.DD",
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  // 글자 입력은 막고, Enter·Space로는 달력을 연다. Tab 이동은 그대로 둔다.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") return;
    event.preventDefault();
    if (event.key === "Enter" || event.key === " ") setOpen(true);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <TextField required={required} status={error ? "error" : "default"}>
        <TextField.Label>{label}</TextField.Label>
        <TextField.Input
          value={value.replaceAll("-", ".")}
          onChange={() => undefined}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          inputMode="none"
          autoComplete="off"
          aria-haspopup="dialog"
          placeholder={placeholder}
          suffix={<Icon name="calendar-days" size="md" aria-hidden />}
          className="cursor-pointer caret-transparent"
        />
        {error && (
          <TextField.Footer>
            <TextField.Helper>{error}</TextField.Helper>
          </TextField.Footer>
        )}
      </TextField>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="bg-surface-shallow rounded-t-16 fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[767px] flex-col gap-4 px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]"
        >
          <div aria-hidden className="mx-auto h-1 w-20 rounded-[2px] bg-[#bab9bf]" />
          <Dialog.Title className="text-title-1 font-title-subtle text-object-bolder">
            {label}
          </Dialog.Title>
          <Calendar
            value={value}
            disablePast={disablePast}
            onSelect={(next) => {
              onChange(next);
              setOpen(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * 시트가 열릴 때만 그려지므로 오늘 날짜를 여기서 구한다.
 * cacheComponents에서는 렌더링 중 new Date()가 미리 렌더링(prerender) 값으로 굳을 수 있어 화면 밖에서 계산하지 않는다.
 */
function Calendar({
  value,
  disablePast,
  onSelect,
}: {
  value: string;
  disablePast?: boolean;
  onSelect: (value: string) => void;
}) {
  const min = disablePast ? todayKst() : undefined;
  return (
    <DatePicker
      className="self-center"
      value={value ? fromDateString(value) : null}
      minDate={min ? fromDateString(min) : undefined}
      isDateDisabled={min ? (date) => toDateString(date) < min : undefined}
      onChange={(date) => onSelect(date ? toDateString(date) : "")}
    />
  );
}
