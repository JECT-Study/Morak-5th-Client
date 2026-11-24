import type { ReactNode } from "react";

import type { ReviewDetail } from "../types";
import { formatDateTime, nicknameLabel, statusLabel } from "../utils";

/** 판정 직후 결과(Figma "승인 완료"·"거절 완료"). 어느 결과가 어떻게 반영되는지 알려준다. */
export function JudgeDoneCard({ approved }: { approved: boolean }) {
  return (
    <article className="border-line-subtle rounded-6 flex flex-col gap-2 border p-4">
      <h2 className="text-title-2 font-title text-fg-primary">
        {approved ? "승인 완료" : "거절 완료"}
      </h2>
      <p className="text-body-md font-body-normal text-fg-primary">
        {approved ? "인증을 승인했어요." : "인증을 거절했어요."}
      </p>
      <p className="text-label-md font-label-normal text-fg-secondary">
        {approved
          ? "검수 상태 ‘승인’ / 성공 실적 반영 / 공유 피드 공개"
          : "검수 상태 ‘거절’ / 실패 실적 반영 / 공유 피드 비노출"}
      </p>
      <p className="text-label-md font-label-normal text-fg-secondary">
        {approved ? "처리한 인증은 미검수 목록에서 제외돼요." : "사유와 처리 이력을 조회해요."}
      </p>
    </article>
  );
}

/** 처리된 인증의 판정 결과·사유·처리 운영진·처리 시각. 조회 전용이다. (Figma "다른 운영진이 먼저 판정한 경우") */
export function JudgeHistory({
  detail,
  title,
  description,
}: {
  detail: ReviewDetail;
  title: string;
  description?: ReactNode;
}) {
  const { judge } = detail;
  return (
    <section className="border-line-subtle rounded-6 flex flex-col gap-3 border p-4">
      <h2 className="text-title-2 font-title text-fg-primary">{title}</h2>
      {description && (
        <p className="text-body-md font-body-normal text-fg-primary">{description}</p>
      )}
      <dl className="border-line-subtle rounded-4 text-body-md font-body-normal text-fg-primary flex flex-col gap-1 border p-3">
        <HistoryRow term="판정 결과" value={statusLabel(detail.status)} />
        {judge?.rejectReason && <HistoryRow term="거절 사유" value={judge.rejectReason} />}
        <HistoryRow term="처리 운영진" value={nicknameLabel(judge?.judgeNickname ?? null)} />
        <HistoryRow term="처리 시각" value={judge ? formatDateTime(judge.judgedAt) : "-"} />
      </dl>
    </section>
  );
}

function HistoryRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-fg-secondary w-24 shrink-0">{term}</dt>
      <dd className="break-words">{value}</dd>
    </div>
  );
}
