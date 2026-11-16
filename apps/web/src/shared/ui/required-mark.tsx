/** 필수 항목 라벨 뒤의 * 표시. 스크린리더는 읽지 않는다(입력에 aria-required가 따로 붙는다). */
export default function RequiredMark() {
  return (
    <span aria-hidden className="text-fg-brand-strong">
      *
    </span>
  );
}
