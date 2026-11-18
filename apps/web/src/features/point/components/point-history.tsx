"use client";

import { Fragment } from "react";

import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";

import {
  formatPoint,
  formatPointChange,
  formatTransactionTime,
  toTransactionLabel,
} from "../format";
import { usePointLedger } from "../use-point-ledger";

/**
 * 포인트 내역(위키 6.7). 사용 가능한 포인트와 거래 내역을 최신순으로 보여 준다.
 * 시안이 없어 기존 토큰으로 임시 구성했다.
 * TODO: 광고 보고 받기·출석 안내는 광고 API와 시안이 나오면 추가한다.
 */
export default function PointHistory() {
  const {
    data,
    error,
    isPending,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePointLedger();

  if (isPending) {
    return (
      <main
        aria-busy="true"
        aria-label="포인트 내역을 불러오는 중"
        className="flex flex-col gap-4 p-4"
      >
        <Skeleton className="rounded-12 h-24" />
        <Skeleton className="rounded-12 h-48" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-body-md font-body-normal text-fg-tertiary">정보를 불러오지 못했어요.</p>
        <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
          다시 시도
        </Button>
      </main>
    );
  }

  const balance = data.pages[0].balance;
  const transactions = data.pages.flatMap((page) => page.transactions);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <section className="bg-surface-primary rounded-12 flex flex-col gap-1 p-4">
        <h2 className="text-label-md font-label-normal text-fg-tertiary">사용 가능한 포인트</h2>
        <p className="text-title-3 font-title text-fg-primary">{formatPoint(balance)}</p>
      </section>

      <section aria-label="포인트 내역" className="flex flex-col gap-2">
        {transactions.length === 0 ? (
          <p className="text-body-md font-body-normal text-fg-tertiary py-16 text-center">
            아직 포인트 내역이 없어요.
          </p>
        ) : (
          <ul className="bg-surface-primary rounded-12 flex flex-col px-4">
            {transactions.map((transaction, index) => (
              <Fragment key={transaction.id}>
                {index > 0 && <Separator />}
                <li className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-label-lg font-label-strong text-fg-primary">
                      {toTransactionLabel(transaction)}
                    </span>
                    {transaction.challengeTitle && (
                      <span className="text-body-sm font-body-normal text-fg-secondary truncate">
                        {transaction.challengeTitle}
                      </span>
                    )}
                    <time
                      dateTime={transaction.createdAt}
                      className="text-body-xs font-body-normal text-fg-quaternary"
                    >
                      {formatTransactionTime(transaction.createdAt)}
                    </time>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span
                      className={`text-label-lg font-label-strong ${transaction.amount > 0 ? "text-fg-brand-strong" : "text-fg-primary"}`}
                    >
                      {formatPointChange(transaction.amount)}
                    </span>
                    <span className="text-body-xs font-body-normal text-fg-quaternary">
                      잔액 {formatPoint(transaction.balanceAfter)}
                    </span>
                  </div>
                </li>
              </Fragment>
            ))}
          </ul>
        )}

        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "불러오는 중…" : "더 보기"}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
