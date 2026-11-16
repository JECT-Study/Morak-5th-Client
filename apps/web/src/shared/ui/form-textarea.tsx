import type { ComponentProps } from "react";

import { TextField } from "./text-field";

type FormTextareaProps = ComponentProps<typeof TextField.Textarea> & {
  label: string;
  /** 에러 메시지. 있으면 테두리가 빨갛게 바뀌고 입력 아래에 보인다. */
  error?: string;
  /** maxLength가 있을 때 글자 수(0/30)를 보여줄지. 기본 true */
  showCounter?: boolean;
};

/**
 * 라벨 + 여러 줄 입력 + 에러·글자 수를 묶은 Textarea. FormTextField의 여러 줄 버전.
 * RHF의 register 결과를 그대로 펼쳐 넘긴다. 예) <FormTextarea label="소개" {...register("bio")} />
 */
export default function FormTextarea({
  label,
  error,
  required,
  showCounter = true,
  ...controlProps
}: FormTextareaProps) {
  const counter = showCounter && controlProps.maxLength !== undefined;

  return (
    <TextField required={required} status={error ? "error" : "default"}>
      <TextField.Label>{label}</TextField.Label>
      <TextField.Textarea {...controlProps} />
      {(error || counter) && (
        <TextField.Footer>
          {error && <TextField.Helper>{error}</TextField.Helper>}
          {counter && <TextField.Counter />}
        </TextField.Footer>
      )}
    </TextField>
  );
}
