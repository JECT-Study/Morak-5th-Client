"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ApiError } from "@/shared/api/client";
import { todayKst } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import type { ChallengeView } from "../../types";
import { useChallenge } from "../../use-challenge";
import { useStartHeldInfo } from "../../use-start-held";
import { countDays, formatDDay } from "../../utils";
import { CATEGORY_META } from "../category-picker";
import ApplyBar from "./apply-bar";
import ChallengeDetailTabs from "./challenge-detail-tabs";
import ChallengeInfo from "./challenge-info";
import StartHeldNotice from "./start-held-notice";

/** 인증 마감(위키 1. 서비스 요약). 모든 챌린지가 같다. */
const CERTIFICATION_TIME = "매일 23:59까지";

/** 위키에 [확정]으로 적힌 규칙만 안내한다. */
const NOTICES = [
  "인증은 매일 23:59까지 할 수 있어요. 시간이 지나면 그날 인증은 할 수 없어요.",
  "승인된 인증 사진만 팀원에게 보여요.",
];

/** 시작 전 상태. 인증 탭에 시작 후 열린다는 안내를 보여 준다. */
const NOT_STARTED_STATUSES = ["RECRUITING", "START_HELD"];

/** 종료·폐기된 챌린지(위키 5.3). 신청·합류를 진행하지 않는다. */
const CLOSED_STATUSES = ["ENDED", "DISCARDED"];

/** 결과 행이 생기는 내 참가 상태(완주·퇴장·조기 종료). 종료된 챌린지에서 결과 보기를 연다. */
const RESULT_MY_STATUSES = ["COMPLETED", "EXPELLED", "EARLY_ENDED"];

/**
 * 표지 배지 문구(위키 4.1).
 * 모집 중이면 시작까지, 진행 중이면 종료까지 남은 일수. 나머지는 상태 이름.
 */
const toBadgeLabel = ({ status, startDate, endDate, currentCount, capacity }: ChallengeView) => {
  const today = todayKst();
  switch (status) {
    case "RECRUITING":
      if (currentCount >= capacity) return "모집 마감";
      return today < startDate ? formatDDay(countDays(today, startDate) - 1) : "시작 대기";
    case "START_HELD":
      return "시작 보류";
    case "IN_PROGRESS":
      return formatDDay(Math.max(countDays(today, endDate) - 1, 0));
    case "FINALIZING":
      return "결과 집계 중";
    case "ENDED":
      return "종료";
    case "DISCARDED":
      return "폐기됨";
    default:
      return "";
  }
};

/** 인증 규칙은 여러 줄로 입력될 수 있어 줄마다 한 항목으로 나눈다. */
const toLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const errorMessage = (error: Error) => {
  if (error instanceof ApiError && error.status === 403) return "비공개 챌린지라 볼 수 없어요.";
  if (error instanceof ApiError && error.status === 404) return "챌린지를 찾을 수 없어요.";
  return "정보를 불러오지 못했어요.";
};

/**
 * 챌린지 상세(GET /challenges/{id}).
 * TODO: 팀원 목록은 참가자 조회 API가 나오면 붙인다.
 */
export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: challenge, error, isPending, refetch, isRefetching } = useChallenge(id);
  // 시작 보류 안내는 참여자에게만 보인다. 인원·기한·역할이 상세 응답에 없어 내 챌린지 목록에서 가져온다.
  const startHeldVisible =
    challenge?.status === "START_HELD" && challenge.myParticipationStatus !== null;
  const { data: myItem } = useStartHeldInfo(id, startHeldVisible);

  if (isPending) return <ChallengeDetailSkeleton />;

  if (error) {
    // 권한 없음·없는 챌린지는 다시 시도해도 같아서 버튼을 보이지 않는다.
    const retryable = !(error instanceof ApiError && [403, 404].includes(error.status));
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-body-md font-body-normal text-fg-tertiary">{errorMessage(error)}</p>
        {retryable && (
          <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
            다시 시도
          </Button>
        )}
      </main>
    );
  }

  return (
    <>
      {CLOSED_STATUSES.includes(challenge.status) && (
        <p
          role="status"
          className="bg-surface-caution-subtle text-fg-caution text-label-md font-label-normal px-4 py-3"
        >
          이미 종료된 챌린지입니다
        </p>
      )}
      {challenge.status === "ENDED" &&
        RESULT_MY_STATUSES.includes(challenge.myParticipationStatus ?? "") && (
          <div className="px-4 pt-3">
            <Button asChild variant="subtle" size="md" fullWidth>
              <Link href={`/challenges/${challenge.id}/results`}>챌린지 결과 보기</Link>
            </Button>
          </div>
        )}
      {startHeldVisible && myItem?.startHeld && (
        <StartHeldNotice
          challenge={challenge}
          startHeld={myItem.startHeld}
          isHost={myItem.myRole === "HOST"}
        />
      )}
      <ChallengeInfo
        title={challenge.title}
        category={CATEGORY_META[challenge.category].label}
        coverImageUrl={challenge.coverImageUrl}
        dDayLabel={toBadgeLabel(challenge)}
        isPrivate={challenge.visibility === "PRIVATE"}
        verificationLabel="사진 인증"
        startDate={challenge.startDate}
        endDate={challenge.endDate}
        memberCount={challenge.currentCount}
        capacity={challenge.capacity}
        pointAmount={challenge.pointAmount}
      />
      <ChallengeDetailTabs
        notStarted={NOT_STARTED_STATUSES.includes(challenge.status)}
        intro={{
          description: challenge.description,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          certificationTime: CERTIFICATION_TIME,
          verificationMethod: "사진 인증",
          commonMission: challenge.commonMission,
          capacity: challenge.capacity,
          memberCount: challenge.currentCount,
          pointAmount: challenge.pointAmount,
          rules: toLines(challenge.verificationRules),
          notices: NOTICES,
        }}
      />
      <ApplyBar challenge={challenge} />
    </>
  );
}

/** 불러오는 동안 0명·0P 같은 임시 값 대신 보여 줄 뼈대(위키 3.2) */
function ChallengeDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="챌린지 정보를 불러오는 중" className="flex flex-col">
      <Skeleton className="h-[281px] rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}
