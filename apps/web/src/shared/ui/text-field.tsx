"use client";

import {
  createContext,
  use,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from "react";

import { cn } from "@/shared/lib/utils";

import { LabelOption } from "./required-mark";

/**
 * 라벨 + 입력 + 도움말·글자 수를 묶는 입력칸. JDS TextField·Textarea 자리를 잇는다.
 *   <TextField required status="error">
 *     <TextField.Label>닉네임</TextField.Label>
 *     <TextField.Input maxLength={12} />            // 여러 줄은 <TextField.Textarea />
 *     <TextField.Footer>
 *       <TextField.Helper>에러 또는 안내</TextField.Helper>
 *       <TextField.Counter />
 *     </TextField.Footer>
 *   </TextField>
 * 라벨은 htmlFor로, 도움말은 aria-describedby로 입력과 이어져 스크린리더가 함께 읽는다.
 * 에러면 aria-invalid가 붙는다.
 * 모양은 Figma 컴포넌트 "TextField"(라벨 16 Bold + 빨간 *, 높이 52·모서리 12·Line 테두리,
 * 입력·placeholder 16, 글자 수 n/max 14, 안내 14)를 따른다.
 */

type Status = "default" | "error";

type FieldContextValue = {
  inputId: string;
  helperId: string;
  status: Status;
  required: boolean;
  disabled: boolean;
  length: number;
  maxLength: number | undefined;
  setLength: (length: number) => void;
  setMaxLength: (maxLength: number | undefined) => void;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function useField() {
  const context = use(FieldContext);
  if (!context) throw new Error("TextField.* 는 <TextField> 안에서 써야 한다.");
  return context;
}

type TextFieldProps = ComponentProps<"div"> & {
  status?: Status;
  /** 라벨 뒤에 빨간 *를 붙이고 입력에 aria-required를 준다. */
  required?: boolean;
  disabled?: boolean;
};

function TextFieldRoot({
  status = "default",
  required = false,
  disabled = false,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const [length, setLength] = useState(0);
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  return (
    <FieldContext
      value={{
        inputId: `${id}-input`,
        helperId: `${id}-helper`,
        status,
        required,
        disabled,
        length,
        maxLength,
        setLength,
        setMaxLength,
      }}
    >
      <div
        data-slot="text-field"
        className={cn("flex min-w-0 flex-col gap-2", className)}
        {...props}
      />
    </FieldContext>
  );
}

type LabelProps = ComponentProps<"label"> & {
  /** 필수 표시(*) 뒤에 붙는 보조 문구. 예) "복수 선택" */
  option?: string;
};

function Label({ className, children, option, ...props }: LabelProps) {
  const { inputId, required } = useField();
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "text-label-lg font-title text-fg-neutral flex items-center gap-0.5 px-0.5 leading-normal",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="text-danger">
          *
        </span>
      )}
      {option && <LabelOption>{option}</LabelOption>}
    </label>
  );
}

/** 바깥에서 받은 ref(RHF register 등)에 노드를 넘긴다. */
function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/** 입력과 textarea가 함께 쓰는 연결: 글자 수 세기와 접근성 속성. */
function useControl(value: ComponentProps<"input">["value"], maxLength: number | undefined) {
  const field = useField();
  const { setLength, setMaxLength } = field;

  useEffect(() => setMaxLength(maxLength), [maxLength, setMaxLength]);
  // 제어 컴포넌트(value를 넘김)면 값이 바뀔 때마다 센다.
  useEffect(() => {
    if (typeof value === "string") setLength(value.length);
  }, [value, setLength]);

  const ariaProps = {
    id: field.inputId,
    "aria-invalid": field.status === "error" || undefined,
    "aria-required": field.required || undefined,
    "aria-describedby": field.helperId,
    disabled: field.disabled || undefined,
  };
  return { status: field.status, setLength, ariaProps };
}

const boxClassName = (status: Status) =>
  cn(
    "border-line bg-surface-primary flex w-full rounded-12 border transition-colors",
    "focus-within:border-line-focus",
    "has-[:disabled]:border-line-disabled has-[:disabled]:bg-surface-disabled",
    status === "error" && "border-danger focus-within:border-danger",
  );

const controlClassName =
  "text-body-lg font-body-normal text-fg-primary placeholder:text-fg-disabled disabled:text-fg-disabled caret-surface-brand min-w-0 flex-1 bg-transparent outline-none";

type InputProps = ComponentProps<"input"> & {
  /** 입력 오른쪽 아이콘(예: 달력). 꾸밈이면 aria-hidden을 붙여 넘긴다. */
  suffix?: ReactNode;
  /** true면 글자 수(n/max)를 칸 안 오른쪽에 보인다. maxLength가 있어야 한다. */
  counter?: boolean;
};

function Input({
  className,
  suffix,
  counter = false,
  ref,
  value,
  maxLength,
  onChange,
  ...props
}: InputProps) {
  const { status, setLength, ariaProps } = useControl(value, maxLength);
  return (
    <div className={cn(boxClassName(status), "h-13 items-center gap-2 px-4")}>
      <input
        {...ariaProps}
        // RHF register처럼 값을 ref로 넣는 경우(비제어)를 위해 처음 붙을 때도 센다.
        ref={(node) => {
          if (node) setLength(node.value.length);
          assignRef(ref, node);
        }}
        value={value}
        maxLength={maxLength}
        onChange={(event) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
        className={cn(controlClassName, "h-full", className)}
        {...props}
      />
      {counter && <Counter />}
      {suffix && <span className="text-fg-tertiary flex shrink-0 [&_svg]:size-5">{suffix}</span>}
    </div>
  );
}

type TextareaProps = ComponentProps<"textarea"> & {
  /** true면 글자 수(n/max)를 칸 안 아래 오른쪽에 보인다. maxLength가 있어야 한다. */
  counter?: boolean;
};

function Textarea({
  className,
  counter = false,
  ref,
  value,
  maxLength,
  onChange,
  ...props
}: TextareaProps) {
  const { status, setLength, ariaProps } = useControl(value, maxLength);
  return (
    <div className={cn(boxClassName(status), "flex-col gap-0.5 p-4")}>
      <textarea
        {...ariaProps}
        ref={(node) => {
          if (node) setLength(node.value.length);
          assignRef(ref, node);
        }}
        value={value}
        maxLength={maxLength}
        onChange={(event) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
        className={cn(controlClassName, "resize-none", className)}
        {...props}
      />
      {counter && <Counter className="self-end" />}
    </div>
  );
}

/** 입력 아래 안내 줄. 입력과 4px 떨어진다(묶음 간격 8에서 4를 당긴다). */
function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("-mt-1 flex items-start gap-2 px-0.5", className)} {...props} />;
}

/** 안내 또는 에러 문구. 입력의 aria-describedby로 연결된다. */
function Helper({ className, ...props }: ComponentProps<"p">) {
  const { helperId, status } = useField();
  return (
    <p
      id={helperId}
      className={cn(
        "text-body-sm font-body-normal min-w-0 flex-1",
        status === "error" ? "text-danger" : "text-fg-tertiary",
        className,
      )}
      {...props}
    />
  );
}

/** 글자 수(예: 3/12). maxLength가 있는 입력에서만 보인다. 화면용이라 스크린리더는 읽지 않는다. */
function Counter({ className }: { className?: string }) {
  const { length, maxLength } = useField();
  if (maxLength === undefined) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "text-body-sm font-body-normal text-fg-tertiary ml-auto shrink-0 tabular-nums",
        className,
      )}
    >
      {length}/{maxLength}
    </span>
  );
}

export const TextField = Object.assign(TextFieldRoot, {
  Label,
  Input,
  Textarea,
  Footer,
  Helper,
  Counter,
});
