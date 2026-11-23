"use client";

import { useState } from "react";

import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import DateField from "@/shared/ui/date-field";

import { MIN_PERIOD_DAYS, minEndDate } from "../../create-schema";
import type { ChallengeView, MyParticipationItem } from "../../types";
import { useDiscardChallenge, useRescheduleChallenge } from "../../use-start-held";
import { formatMonthDay, formatPeriod } from "../../utils";

type StartHeld = NonNullable<MyParticipationItem["startHeld"]>;

/** 공통 오류. 409는 이미 처리됐거나 상태가 바뀐 경우라 화면을 다시 불러온다. */
const commonErrorMessage = (error: Error, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.code === "CHALLENGE_NOT_START_HELD")
      return "이미 처리된 챌린지예요. 바뀐 상태를 다시 불러왔어요.";
    if (error.code === "CHALLENGE_NOT_OWNER") return "방장만 처리할 수 있어요.";
    if (error.status === 503) return "지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.";
  }
  return fallback;
};

const rescheduleErrorMessage = (error: Error) => {
  if (error instanceof ApiError) {
    if (error.code === "CHALLENGE_INVALID_START_DATE") return "시작일은 내일부터 선택할 수 있어요";
    if (error.code === "CHALLENGE_INVALID_PERIOD")
      return `챌린지 기간은 최소 ${MIN_PERIOD_DAYS}일이어야 해요`;
  }
  return commonErrorMessage(error, "기간을 바꾸지 못했어요. 다시 시도해 주세요.");
};

const discardErrorMessage = (error: Error) => {
  if (error instanceof ApiError && error.code === "CHALLENGE_DISCARD_APPLICATIONS_CHANGED")
    return "폐기하는 동안 참가 신청이 바뀌었어요. 다시 시도해 주세요.";
  return commonErrorMessage(error, "챌린지를 폐기하지 못했어요. 다시 시도해 주세요.");
};

type StartHeldNoticeProps = {
  challenge: ChallengeView;
  startHeld: StartHeld;
  isHost: boolean;
};

/**
 * 시작 보류 안내(위키 5.7). 상세 상단에 보이며, 방장에게만 기간 재설정·폐기 버튼을 준다.
 * 다른 참여자에게는 보류 상태만 안내한다(선택 버튼 없음).
 * 인원은 승인 대기를 빼고 실제 합류한 인원이라 서버가 준 startHeld 값을 쓴다.
 */
export default function StartHeldNotice({ challenge, startHeld, isHost }: StartHeldNoticeProps) {
  const id = String(challenge.id);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const discard = useDiscardChallenge(id);
  // 선택 기한은 예정 시작일을 포함한 3일째 23:59(KST). 서버가 +09:00 시각으로 준다.
  const deadline = `${formatMonthDay(startHeld.recruitDeadline.slice(0, 10))} 23:59까지`;

  return (
    <section
      aria-labelledby="start-held-title"
      className="bg-surface-caution-subtle flex flex-col gap-3 px-4 py-5"
    >
      <h2 id="start-held-title" className="text-title-1 font-title text-fg-primary">
        시작에 필요한 인원이 모이지 않았어요
      </h2>
      <p className="text-body-sm font-body-normal text-fg-secondary break-keep">
        {challenge.title}의 참여 인원은 {startHeld.currentCount}명으로, 최소 {startHeld.minCount}
        명이 필요해요. 총 3일의 추가 모집 기한이 주어져요. 3일 동안 최소 인원이 모집되면, 챌린지는
        다음 날 자정부터 바로 시작해요. 3일 안에 선택하지 않으면 자동으로 폐기돼요.
      </p>

      <dl className="bg-surface-primary rounded-12 text-label-md flex flex-col gap-2 p-4">
        <InfoRow
          label="현재 인원"
          value={`${startHeld.currentCount}명 / 최소 ${startHeld.minCount}명`}
        />
        <InfoRow label="기존 기간" value={formatPeriod(challenge.startDate, challenge.endDate)} />
        <InfoRow label="선택 기한" value={deadline} />
      </dl>

      {isHost &&
        (editing ? (
          <RescheduleForm challengeId={id} onCancel={() => setEditing(false)} />
        ) : (
          <div className="flex flex-col gap-2">
            <Button fullWidth onClick={() => setEditing(true)}>
              기간 다시 설정하기
            </Button>
            <Button
              variant="outline"
              fullWidth
              disabled={discard.isPending}
              onClick={() => setConfirming(true)}
            >
              챌린지 폐기하기
            </Button>
          </div>
        ))}

      {discard.isError && (
        <p role="alert" className="text-label-sm text-danger">
          {discardErrorMessage(discard.error)}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="챌린지를 폐기할까요?"
        description="폐기하면 되돌릴 수 없어요. 참가자의 참여 포인트는 바로 전액 돌려드려요."
        confirmLabel="폐기하기"
        pending={discard.isPending}
        onConfirm={() => discard.mutate(undefined, { onSettled: () => setConfirming(false) })}
      />
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-label-normal text-fg-tertiary shrink-0">{label}</dt>
      <dd className="font-label-strong text-fg-primary text-right">{value}</dd>
    </div>
  );
}

/**
 * 새 기간 입력. 개설과 같은 규칙: 시작일은 내일부터, 기간은 최소 7일(종료일 ≥ 시작일 + 6일).
 * 날짜 칸을 누르면 달력 시트가 열려서, 시트 안에 시트가 겹치지 않게 이 폼은 카드 안에 펼친다.
 */
function RescheduleForm({ challengeId, onCancel }: { challengeId: string; onCancel: () => void }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const reschedule = useRescheduleChallenge(challengeId);

  const startError = submitted && !startDate ? "시작일을 선택해 주세요" : undefined;
  const endError = !submitted
    ? undefined
    : !endDate
      ? "종료일을 선택해 주세요"
      : startDate && endDate < minEndDate(startDate)
        ? `챌린지 기간은 최소 ${MIN_PERIOD_DAYS}일이어야 해요`
        : undefined;

  const submit = () => {
    setSubmitted(true);
    if (!startDate || !endDate || endDate < minEndDate(startDate)) return;
    reschedule.mutate({ startDate, endDate });
  };

  return (
    <div className="bg-surface-primary rounded-12 flex flex-col gap-3 p-4">
      <p className="text-label-md font-label-strong text-fg-primary">새 기간</p>
      {/* items-start: 한쪽에만 오류 문구가 생겨도 다른 칸이 같이 늘어나지 않게 */}
      <div className="flex items-start gap-2">
        <DateField
          label="시작일"
          required
          value={startDate}
          onChange={setStartDate}
          // 백엔드는 KST 기준 내일부터 시작할 수 있다.
          minDaysFromToday={1}
          error={startError}
        />
        <DateField
          label="종료일"
          required
          value={endDate}
          onChange={setEndDate}
          minDaysFromToday={MIN_PERIOD_DAYS}
          minDate={startDate ? minEndDate(startDate) : undefined}
          error={endError}
        />
      </div>

      {reschedule.isError && (
        <p role="alert" className="text-label-sm text-danger">
          {rescheduleErrorMessage(reschedule.error)}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          variant="subtle"
          className="min-w-0 flex-1"
          disabled={reschedule.isPending}
          onClick={onCancel}
        >
          취소
        </Button>
        <Button className="min-w-0 flex-1" disabled={reschedule.isPending} onClick={submit}>
          이 기간으로 다시 모집
        </Button>
      </div>
    </div>
  );
}
