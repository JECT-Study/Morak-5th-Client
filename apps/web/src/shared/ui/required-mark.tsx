/** 필수 항목 라벨 뒤의 * 표시. JDS 필드 라벨과 같은 색(feedback/notifying)을 쓴다. 스크린리더는 읽지 않는다. */
export default function RequiredMark() {
  return (
    <span aria-hidden className="text-(--color-semantic-feedback-notifying-static-inverse-bold)">
      *
    </span>
  );
}
