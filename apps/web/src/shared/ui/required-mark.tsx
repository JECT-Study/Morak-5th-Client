/**
 * 라벨 뒤의 "필수" 표시(Figma 온보딩 정보 입력). 입력에 aria-required가 따로 붙어 스크린리더는 이 글자를 읽지 않는다.
 * children으로 문구를 바꿀 수 있다. 예) <RequiredMark>최소 1개 필수</RequiredMark>
 */
export default function RequiredMark({ children = "필수" }: { children?: string }) {
  return (
    <span aria-hidden className="text-label-sm font-label-normal text-fg-brand">
      {children}
    </span>
  );
}

/**
 * 라벨 뒤 보조 문구(예: 복수 선택). 필수 표시(*) 뒤에 옅게 붙고, 안내라 스크린리더도 읽는다.
 * 비워도 되는 칸이라고 "선택"을 붙이지는 않는다(필수만 *로 표시).
 */
export function LabelOption({ children }: { children: string }) {
  return <span className="text-body-sm font-body-normal text-fg-tertiary ml-1">{children}</span>;
}
