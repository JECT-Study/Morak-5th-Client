import { TextField } from "@jects/jds";
import type { ComponentProps } from "react";

type FormTextFieldProps = ComponentProps<typeof TextField.Input> & {
  label: string;
  /** 에러 메시지. 있으면 테두리가 빨갛게 바뀌고 입력 아래에 보인다. */
  error?: string;
};

/**
 * 라벨 + 입력 + 에러 메시지를 묶은 TextField.
 * RHF의 register 결과를 그대로 펼쳐 넘긴다. 예) <FormTextField label="제목" {...register("title")} />
 * required는 바깥 TextField에 줘야 라벨에 * 표시가 붙어서 따로 꺼낸다.
 */
export default function FormTextField({
  label,
  error,
  required,
  ...inputProps
}: FormTextFieldProps) {
  return (
    <TextField required={required} status={error ? "error" : "default"}>
      <TextField.Label>{label}</TextField.Label>
      <TextField.Input {...inputProps} />
      {error && (
        <TextField.Footer>
          <TextField.Helper>{error}</TextField.Helper>
        </TextField.Footer>
      )}
    </TextField>
  );
}
