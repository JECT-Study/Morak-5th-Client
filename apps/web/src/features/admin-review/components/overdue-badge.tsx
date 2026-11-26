/** 검수 마감이 지난 미검수 인증에 붙이는 표시. 자동 승인되지 않으므로 운영진이 처리해야 한다. */
export default function OverdueBadge() {
  return (
    <span className="bg-surface-danger-subtle text-danger text-label-sm font-label-strong rounded-4 ml-2 inline-flex h-5 items-center px-2 whitespace-nowrap">
      마감 지남
    </span>
  );
}
