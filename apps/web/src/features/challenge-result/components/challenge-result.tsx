"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { useChallenge } from "@/features/challenge/use-challenge";
import { countDays } from "@/features/challenge/utils";
import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import type { MyResult, TeamResult } from "../types";
import { useMyResult, useTeamResult } from "../use-challenge-result";

/** 결과 종류(피그마 "챌린지 최종 결과 화면정의서"). */
type ResultKind = "completed" | "earlyEnded" | "expelled";

/**
 * 정상 종료면 퇴장 없이 기간까지 참여한 사람은 모두 완주다.
 * 그래서 완주도 퇴장도 아니면 인원 미달 조기 종료로 남은 참여자다(위키 4.4 EARLY_ENDED).
 */
const toKind = (result: MyResult): ResultKind => {
  if (result.expelled) return "expelled";
  return result.completed ? "completed" : "earlyEnded";
};

/** 서버 퍼센트를 그대로 보여 준다. 소수점이 0이면 뗀다. 예) 85.5 → "85.5%", 100.0 → "100%" */
const formatRate = (rate: number) => `${Number(rate.toFixed(1))}%`;
const formatCount = (count: number) => `${count.toLocaleString("ko-KR")}회`;
const formatPoint = (point: number) => `${point.toLocaleString("ko-KR")}P`;

const errorMessage = (error: Error) => {
  if (error instanceof ApiError) {
    if (error.status === 409) return "결과를 집계하고 있어요. 확정되면 볼 수 있어요.";
    if (error.status === 403) return "챌린지 참가자만 볼 수 있어요.";
    if (error.status === 404) return "챌린지를 찾을 수 없어요.";
  }
  return "정보를 불러오지 못했어요.";
};

/**
 * 챌린지 최종 결과(위키 5.12). 정상 종료·인원 미달 조기 종료·개인 퇴장을 나눠 보여 준다.
 * 숫자는 서버가 확정한 값 그대로 쓴다.
 * TODO(D-28): 정산(반환·추가 보상·차감 포인트)과 완주 횟수·새 메달은 결과 API에 붙으면 보여 준다.
 */
export default function ChallengeResult() {
  const { id } = useParams<{ id: string }>();
  const challenge = useChallenge(id);
  const mine = useMyResult(id);
  const kind = mine.data ? toKind(mine.data) : null;
  // 퇴장자는 팀이 계속 진행될 수 있어 팀 결과를 보여 주지 않는다(화면정의서).
  const team = useTeamResult(id, kind === "completed");

  const error = mine.error ?? challenge.error ?? team.error;
  if (error) {
    const retryable = !(error instanceof ApiError && [403, 404, 409].includes(error.status));
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-body-md font-body-normal text-fg-tertiary text-center">
          {errorMessage(error)}
        </p>
        {retryable && (
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              void mine.refetch();
              void challenge.refetch();
              if (kind === "completed") void team.refetch();
            }}
          >
            다시 시도
          </Button>
        )}
        <HomeButton />
      </main>
    );
  }

  if (!mine.data || !challenge.data || (kind === "completed" && !team.data)) {
    return <ChallengeResultSkeleton />;
  }

  const { title, startDate, endDate, pointAmount } = challenge.data;
  const totalDays = countDays(startDate, endDate);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 px-4 pt-4 pb-6">
        {kind === "completed" && (
          <CompletedResult title={title} totalDays={totalDays} mine={mine.data} team={team.data!} />
        )}
        {kind === "earlyEnded" && <EarlyEndedResult title={title} mine={mine.data} />}
        {kind === "expelled" && (
          <ExpelledResult title={title} mine={mine.data} pointAmount={pointAmount} />
        )}
      </div>
      <div className="bg-background-primary sticky bottom-0 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <HomeButton />
      </div>
    </main>
  );
}

function CompletedResult({
  title,
  totalDays,
  mine,
  team,
}: {
  title: string;
  totalDays: number;
  mine: MyResult;
  team: TeamResult;
}) {
  return (
    <>
      <ResultHeading
        title={title}
        headline="끝까지 함께했어요!"
        lines={[`${totalDays}일 챌린지 정상 종료`, "퇴장 없이 예정 기간까지 참여했어요."]}
      />
      <Section title="최종 팀 달성률">
        <p className="text-title-4 font-title text-fg-brand-strong">
          {formatRate(team.teamAchievementRate)}
        </p>
        <p className="text-body-sm font-body-normal text-fg-secondary">
          성공 {formatCount(team.teamApprovedCount)} / 인증 대상 {formatCount(team.teamTotalCount)}
        </p>
      </Section>
      <MyCertificationSection mine={mine} />
    </>
  );
}

function EarlyEndedResult({ title, mine }: { title: string; mine: MyResult }) {
  return (
    <>
      <ResultHeading
        title={title}
        headline="인원 부족으로 조기 종료됐어요"
        lines={["최소 운영 인원보다 적어 챌린지가 종료됐어요.", "회원님의 실패로 처리되지 않아요."]}
      />
      <Section title="내 정산 기준">
        <p className="text-body-sm font-body-normal text-fg-secondary">
          해당 챌린지에서 종료 전날까지의 개인 인증 성공률
        </p>
        <p className="text-title-4 font-title text-fg-brand-strong">
          {formatRate(mine.achievementRate)}
        </p>
        <p className="text-body-sm font-body-normal text-fg-secondary">
          승인 {formatCount(mine.approvedCount)} / 인증 의무 {formatCount(mine.totalCount)}
        </p>
        <p className="text-body-2xs font-body-normal text-fg-tertiary">
          다른 챌린지를 합친 프로필 인증률과 구분해요.
        </p>
      </Section>
      <Section title="활동 기록">
        <Notes
          items={[
            "이번 챌린지는 완주 횟수·메달·중도 실패 횟수에 추가되지 않아요.",
            "종료 전날까지의 개인 인증 실적은 유지돼요.",
          ]}
        />
      </Section>
      <Section title="지난 기록 확인">
        <Notes items={["보관함에서 과거 인증 사진과 팀 채팅을 확인할 수 있어요."]} />
      </Section>
    </>
  );
}

function ExpelledResult({
  title,
  mine,
  pointAmount,
}: {
  title: string;
  mine: MyResult;
  pointAmount: number;
}) {
  return (
    <>
      <ResultHeading
        title={title}
        headline="인증 실패 누적으로 퇴장했어요"
        lines={["이번 챌린지 참여가 종료됐어요."]}
      />
      <MyCertificationSection mine={mine} />
      {/* 퇴장자는 반환 0, 전액 차감이다(위키 5.12). 포인트를 건 챌린지에서만 보인다. */}
      {pointAmount > 0 && (
        <Section title="참여 포인트 처리">
          <dl className="flex flex-col gap-2">
            <InfoRow label="걸어 둔 포인트" value={formatPoint(pointAmount)} />
            <InfoRow label="반환 포인트" value={formatPoint(0)} />
            <InfoRow label="전액 차감" value={formatPoint(pointAmount)} />
          </dl>
          <p className="text-body-2xs font-body-normal text-fg-tertiary">
            개인 퇴장 시 팀의 최종 결과와 관계없이 참여 포인트가 전액 차감돼요.
          </p>
        </Section>
      )}
      <Section title="프로필과 기록">
        <Notes
          items={[
            "중도 실패 챌린지 횟수 +1회",
            "완주 횟수·완주 메달은 추가되지 않아요.",
            "퇴장 공지 전까지의 개인 인증 실적은 유지돼요.",
            "채팅은 실제 퇴장 시점 이전 대화만 열람할 수 있어요.",
          ]}
        />
      </Section>
    </>
  );
}

function ResultHeading({
  title,
  headline,
  lines,
}: {
  title: string;
  headline: string;
  lines: string[];
}) {
  return (
    <header className="flex flex-col gap-1">
      <p className="text-label-md font-label-normal text-fg-tertiary">{title}</p>
      <h2 className="text-title-3 font-title text-fg-primary break-keep">{headline}</h2>
      {lines.map((line) => (
        <p key={line} className="text-body-sm font-body-normal text-fg-secondary break-keep">
          {line}
        </p>
      ))}
    </header>
  );
}

function MyCertificationSection({ mine }: { mine: MyResult }) {
  return (
    <Section title="내 인증 기록">
      <dl className="flex flex-col gap-2">
        <InfoRow label="승인된 인증" value={formatCount(mine.approvedCount)} />
        <InfoRow label="인증 의무 횟수" value={formatCount(mine.totalCount)} />
      </dl>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface-secondary rounded-16 flex flex-col gap-2 p-4">
      <h3 className="text-title-1 font-title text-fg-primary">{title}</h3>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-label-md flex items-center justify-between gap-3">
      <dt className="font-label-normal text-fg-tertiary">{label}</dt>
      <dd className="font-label-strong text-fg-primary">{value}</dd>
    </div>
  );
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="text-body-sm font-body-normal text-fg-secondary flex list-disc flex-col gap-1 pl-5 break-keep">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function HomeButton() {
  return (
    <Button asChild fullWidth>
      <Link href="/">홈으로</Link>
    </Button>
  );
}

function ChallengeResultSkeleton() {
  return (
    <main aria-busy="true" aria-label="결과를 불러오는 중" className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="rounded-16 h-32" />
      <Skeleton className="rounded-16 h-24" />
    </main>
  );
}
