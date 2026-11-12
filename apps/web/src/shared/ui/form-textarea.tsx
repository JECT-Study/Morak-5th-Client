import { Textarea } from "@jects/jds";
import type { ComponentProps } from "react";

type FormTextareaProps = ComponentProps<typeof Textarea.Control> & {
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
    <Textarea required={required} status={error ? "error" : "default"}>
      <Textarea.Label>{label}</Textarea.Label>
      <Textarea.Control {...controlProps} />
      {(error || counter) && (
        <Textarea.Footer>
          {error && <Textarea.Helper>{error}</Textarea.Helper>}
          {counter && <Textarea.Counter />}
        </Textarea.Footer>
      )}
    </Textarea>
  );
}
