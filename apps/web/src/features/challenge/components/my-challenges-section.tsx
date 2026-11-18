"use client";

import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { myChallengesMock } from "@/mocks/data/my-challenges";

import { useMyChallenges } from "../my-challenges";
import ChallengeCardCarousel from "./challenge-card-carousel";
import MyChallengesEmpty from "./my-challenges-empty";

const MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

/**
 * 홈 내 챌린지(GET /users/me/participations, HOME). 위키 5.1.
 * - 비로그인(401)이면 빈 상태와 같은 안내를 보여 준다(비로그인 홈은 [OPEN, FE-O2]).
 * - '오늘의 인증 · N개 남음'은 인증 집계가 들어온 뒤(오늘 인증 현황이 있을 때)만 보인다.
 */
export default function MyChallengesSection() {
  const { data, error, isPending, refetch, isRefetching } = useMyChallenges();
  const challenges = MOCKING ? myChallengesMock : data;

  if (!MOCKING && isPending) {
    return (
      <div aria-busy="true" aria-label="내 챌린지를 불러오는 중" className="px-4 pt-10">
        <div className="bg-surface-tertiary rounded-12 h-[480px] animate-pulse" />
      </div>
    );
  }

  if (!MOCKING && error && !(error instanceof ApiError && error.status === 401)) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16">
        <p className="text-body-md font-body-normal text-fg-tertiary">정보를 불러오지 못했어요.</p>
        <Button variant="outline" size="md" onClick={() => refetch()} disabled={isRefetching}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!challenges || challenges.length === 0) return <MyChallengesEmpty />;

  // 인증 집계가 있는 진행 중 챌린지 중 오늘 아직 제출하지 않은 것
  const counted = challenges.filter((c) => c.phase === "IN_PROGRESS" && c.todayCertifications);
  const remaining = counted.filter((c) => c.myTodayStatus === null).length;

  return (
    <>
      {counted.length > 0 && (
        <p className="text-label-md font-label-normal text-fg-secondary px-4">
          오늘의 인증 · {remaining > 0 ? `${remaining}개 남음` : "모두 완료"}
        </p>
      )}
      <ChallengeCardCarousel challenges={challenges} />
    </>
  );
}
