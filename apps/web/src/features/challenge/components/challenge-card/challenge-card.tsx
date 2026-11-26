import { Camera, CircleCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import type { MyChallengeCardData } from "../../types";
import ChallengeIntro from "./challenge-intro";
import ChallengeProgress from "./challenge-progress";
import TeamStats from "./team-stats";
import TodayCertifications from "./today-certifications";

type ChallengeCardProps = {
  challenge: MyChallengeCardData;
  className?: string;
};

/**
 * 홈(내 챌린지)의 챌린지 카드. Figma "챌린지 다이어리" 챌린지 카드(위키 4.1, 5.1).
 * - 시작 전·결과 집계 중에도 같은 배치. 시작 전이면 진행 영역에 D-n과 시작일을 보여 준다.
 * - 오늘 인증한 팀원은 인증 집계가 있을 때만, '지금 인증하기'는 진행 중일 때만 보인다.
 * - '판정하기 N'은 내가 판정할 인증이 있을 때만(방장·부방장, 포인트 없는 챌린지) 인증 관리로 보낸다.
 *   판정 마감이 다음 날 12:00라 결과 집계 중에도 남아 있을 수 있다.
 * - 팀 채팅 버튼은 두지 않는다(하단 채팅 탭에서 들어간다).
 */
export default function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  const today = challenge.todayCertifications;
  return (
    <article
      className={`bg-surface-primary border-line-subtle rounded-12 flex flex-col gap-3 border p-4 ${className ?? ""}`}
    >
      <ChallengeIntro
        id={challenge.id}
        category={challenge.category}
        isPrivate={challenge.isPrivate}
        title={challenge.title}
        description={challenge.description}
      />
      <ChallengeProgress
        currentDay={challenge.currentDay}
        totalDays={challenge.totalDays}
        startDate={challenge.startDate}
        endDate={challenge.endDate}
      />
      <TeamStats
        memberCount={challenge.memberCount}
        successRate={challenge.successRate}
        depositAmount={challenge.depositAmount}
      />
      {today && (
        <>
          <Separator />
          <TodayCertifications targetCount={today.targetCount} certifications={today.photos} />
        </>
      )}
      <div className="mt-auto flex flex-col gap-2">
        {challenge.pendingJudgeCount > 0 && (
          <Button asChild variant="subtle" fullWidth>
            <Link href={`/challenges/${challenge.id}/manage/certifications`}>
              <CircleCheck aria-hidden />
              판정할 인증 {challenge.pendingJudgeCount}건 · 판정하기
            </Link>
          </Button>
        )}
        {challenge.phase === "IN_PROGRESS" && (
          <Button asChild fullWidth>
            <Link href={`/challenges/${challenge.id}/certifications/new`}>
              <Camera aria-hidden />
              지금 인증하기
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
