import Link from "next/link";

import { Button } from "@/shared/ui/button";

import type { ReviewChallengeSummary } from "../types";

const cellClass = "border-line-subtle border px-2 py-2 text-left align-middle";

/** 챌린지별 검수 현황(위키 D-2). 미검수·마감 지난 건수를 한눈에 보고, 그 챌린지의 미검수만 바로 열 수 있다. */
export default function ChallengeSummary({ summaries }: { summaries: ReviewChallengeSummary[] }) {
  if (summaries.length === 0) return null;

  return (
    <details className="border-line-subtle rounded-8 border px-4 py-3">
      <summary className="text-label-lg font-label-strong text-fg-primary cursor-pointer">
        챌린지별 검수 현황
      </summary>
      <table className="text-body-md font-body-normal text-fg-primary mt-3 w-full border-collapse">
        <thead>
          <tr className="bg-surface-secondary">
            {["챌린지", "미검수", "마감 지남", "승인", "거절", "바로가기"].map((title) => (
              <th key={title} scope="col" className={`${cellClass} font-body-strong`}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summaries.map((item) => (
            <tr key={item.challengeId}>
              <td className={cellClass}>{item.title}</td>
              <td className={cellClass}>{item.pendingCount}</td>
              <td className={`${cellClass} ${item.overdueCount > 0 ? "text-danger" : ""}`}>
                {item.overdueCount}
              </td>
              <td className={cellClass}>{item.approvedCount}</td>
              <td className={cellClass}>{item.rejectedCount}</td>
              <td className={cellClass}>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin?challengeId=${item.challengeId}`}>미검수 보기</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
