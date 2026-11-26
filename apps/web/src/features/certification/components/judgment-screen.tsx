"use client";

import { UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useChallenge } from "@/features/challenge/use-challenge";
import { ApiError } from "@/shared/api/client";
import BottomSheet from "@/shared/ui/bottom-sheet";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { TextField } from "@/shared/ui/text-field";

import type { PendingJudgment } from "../types";
import { useJudgeCertification, usePendingJudgments } from "../use-judgment";

const REJECT_REASON_MAX = 200;

const ROLE_LABEL: Record<string, string> = { HOST: "방장", DEPUTY: "부방장" };

const kst = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", ...options }).format(new Date(iso));

/** 제출 시각 "11월 25일 06:02" */
const formatSubmitted = (iso: string) =>
  kst(iso, { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** 판정 마감 "11월 26일 12:00까지" */
const formatDue = (iso: string) => `${formatSubmitted(iso)}까지`;

/** 인증 규칙은 여러 줄로 입력될 수 있어 줄마다 한 항목으로 나눈다. */
const toLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** 판정 실패 문구. 이미 판정됨·마감 지남(409), 권한 없음(403), 사유 오류(400)는 서버 문구를 보인다. */
const judgeErrorText = (error: Error) => {
  if (error instanceof ApiError && [400, 403, 409].includes(error.status) && error.message) {
    return error.message;
  }
  return "처리하지 못했어요. 다시 시도해 주세요.";
};

/**
 * 인증 관리(방장·부방장 인증 판정, 위키 5.10). 시안이 없어 위키와 인증 피드 카드 모양으로 구성했다.
 * 인증 규칙 → 판정할 인증(제출 순): 제출자·역할·제출 시각·판정 마감·사진 + 거절 / 승인.
 * - 승인은 바로 보낸다(확인 단계는 [OPEN, FE-O7]). 거절은 사유(필수, 200자)를 받는다.
 * - 처리한 인증은 목록에서 빠진다. 마감(다음 날 12:00)이 지나면 서버가 자동 승인한다.
 * - 포인트를 건 공개 챌린지는 운영진이 판정해서 이 화면에서는 판정할 게 없다.
 * TODO: 판정 번복은 정책이 정해지면 붙인다([OPEN, FE-O7]).
 */
export default function JudgmentScreen() {
  const { id } = useParams<{ id: string }>();
  const challenge = useChallenge(id);
  const pending = usePendingJudgments(id);
  const judge = useJudgeCertification(id);
  const [rejecting, setRejecting] = useState<PendingJudgment | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const reviewedByStaff =
    challenge.data !== undefined &&
    challenge.data.pointAmount > 0 &&
    challenge.data.visibility === "PUBLIC";

  const onJudgeError = (error: Error) => {
    // 이미 판정됐거나 마감이 지났으면 목록을 서버 상태로 맞춘다.
    if (error instanceof ApiError && error.status === 409) void pending.refetch();
  };

  const approve = (item: PendingJudgment) => {
    setDone(null);
    judge.mutate(
      { certificationId: item.certificationId, decision: "approve" },
      {
        onSuccess: () => setDone(`${item.nickname ?? "팀원"}님의 인증을 승인했어요.`),
        onError: onJudgeError,
      },
    );
  };

  const reject = () => {
    if (!rejecting) return;
    const target = rejecting;
    setDone(null);
    judge.mutate(
      { certificationId: target.certificationId, decision: "reject", reason: reason.trim() },
      {
        onSuccess: () => {
          setRejecting(null);
          setReason("");
          setDone(`${target.nickname ?? "팀원"}님의 인증을 거절했어요.`);
        },
        onError: onJudgeError,
      },
    );
  };

  if (pending.isPending || challenge.isPending) {
    return (
      <main aria-busy="true" aria-label="불러오는 중" className="flex flex-col gap-3 p-4">
        <Skeleton className="rounded-12 h-20" />
        <Skeleton className="rounded-12 h-80" />
      </main>
    );
  }

  if (pending.error) {
    const forbidden = pending.error instanceof ApiError && pending.error.status === 403;
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-body-md font-body-normal text-fg-tertiary">
          {forbidden ? "참여 중인 챌린지에서만 볼 수 있어요." : "정보를 불러오지 못했어요."}
        </p>
        {!forbidden && (
          <Button variant="outline" size="md" onClick={() => pending.refetch()}>
            다시 시도
          </Button>
        )}
      </main>
    );
  }

  const items = pending.data;
  const rules = challenge.data ? toLines(challenge.data.verificationRules) : [];
  // 목록 안 카드의 판정 실패만 카드에 보인다(거절 시트에서 난 실패는 시트에 보인다).
  const cardErrorId = judge.isError && !rejecting ? judge.variables?.certificationId : undefined;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6">
      {done && (
        <p
          role="status"
          className="bg-surface-info-subtle text-fg-info text-label-md font-label-normal rounded-12 px-4 py-3"
        >
          {done}
        </p>
      )}

      {rules.length > 0 && (
        <section
          aria-labelledby="judgment-rules"
          className="bg-surface-secondary rounded-12 flex flex-col gap-2 p-4"
        >
          <h2 id="judgment-rules" className="text-label-lg font-label-strong text-fg-primary">
            인증 규칙
          </h2>
          <ul className="text-body-sm font-body-normal text-fg-secondary flex list-disc flex-col gap-1 pl-5 break-keep">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      )}

      {items.length === 0 ? (
        <p className="text-body-sm font-body-normal text-fg-tertiary py-16 text-center break-keep">
          {reviewedByStaff
            ? "포인트를 건 공개 챌린지는 운영진이 인증을 판정해요."
            : "판정할 인증이 없어요."}
        </p>
      ) : (
        <>
          <p className="text-body-sm font-body-normal text-fg-secondary break-keep">
            판정하지 않으면 마감 시각에 자동으로 승인돼요.
          </p>
          <ul aria-label="판정할 인증" className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.certificationId}>
                <JudgmentCard
                  item={item}
                  busy={judge.isPending}
                  error={
                    cardErrorId === item.certificationId && judge.error
                      ? judgeErrorText(judge.error)
                      : null
                  }
                  onApprove={() => approve(item)}
                  onReject={() => {
                    judge.reset();
                    setReason("");
                    setRejecting(item);
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <BottomSheet
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open && !judge.isPending) {
            setRejecting(null);
            judge.reset();
          }
        }}
        title="인증을 거절할까요?"
      >
        <div className="flex flex-col gap-4">
          <TextField disabled={judge.isPending} required>
            <TextField.Label>거절 사유</TextField.Label>
            <TextField.Textarea
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={REJECT_REASON_MAX}
              placeholder="예: 인증 사진에서 운동 시간을 확인할 수 없어요."
            />
            <TextField.Footer>
              <TextField.Helper>사유는 인증을 낸 팀원에게 보여요.</TextField.Helper>
              <TextField.Counter />
            </TextField.Footer>
          </TextField>
          {judge.isError && rejecting && (
            <p role="alert" className="text-label-sm font-label-normal text-danger text-center">
              {judgeErrorText(judge.error)}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={judge.isPending}
              onClick={() => {
                setRejecting(null);
                judge.reset();
              }}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              disabled={judge.isPending || reason.trim().length === 0}
              onClick={reject}
            >
              {judge.isPending ? "거절하는 중이에요" : "거절"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </main>
  );
}

function JudgmentCard({
  item,
  busy,
  error,
  onApprove,
  onReject,
}: {
  item: PendingJudgment;
  busy: boolean;
  error: string | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  const name = item.nickname ?? "알 수 없음";
  const role = ROLE_LABEL[item.role];
  return (
    <article className="border-line rounded-12 bg-surface-primary flex flex-col gap-3 border p-4">
      <header className="flex items-center gap-3">
        <span className="bg-surface-secondary text-fg-tertiary relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {item.profileImageUrl ? (
            // 프로필 사진 저장소 주소라 최적화하지 않는다
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.profileImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserRound aria-hidden className="size-5" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-label-lg font-label-normal text-fg-primary truncate">
            {name}
            {role && <span className="text-fg-tertiary"> · {role}</span>}
          </span>
          <span className="text-label-xs text-fg-tertiary">
            {formatSubmitted(item.submittedAt)} 제출
          </span>
        </span>
      </header>
      {item.imageUrl ? (
        // 300초짜리 서명 주소라 최적화하지 않는다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={`${name}의 인증 사진`}
          loading="lazy"
          className="rounded-8 bg-surface-secondary aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="rounded-8 bg-surface-secondary text-fg-tertiary text-body-sm font-body-normal flex aspect-[4/3] w-full items-center justify-center">
          사진을 불러오지 못했어요
        </div>
      )}
      <p className="text-label-sm text-fg-tertiary">판정 마감 {formatDue(item.judgeDueAt)}</p>
      {error && (
        <p role="alert" className="text-label-sm font-label-normal text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="md" className="flex-1" disabled={busy} onClick={onReject}>
          거절
        </Button>
        <Button size="md" className="flex-1" disabled={busy} onClick={onApprove}>
          승인
        </Button>
      </div>
    </article>
  );
}
