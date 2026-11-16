import { Camera } from "lucide-react";
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

/** 홈(내 챌린지)의 챌린지 카드. Figma "챌린지 다이어리" 챌린지 카드 */
export default function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  return (
    <article
      className={`bg-surface-primary border-line-subtle rounded-12 flex flex-col gap-3 border p-5 ${className ?? ""}`}
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
      <Separator />
      <TodayCertifications
        memberCount={challenge.memberCount}
        certifications={challenge.todayCertifications}
      />
      <Button asChild fullWidth>
        <Link href={`/challenges/${challenge.id}/certifications/new`}>
          <Camera aria-hidden />
          지금 인증하기
        </Link>
      </Button>
    </article>
  );
}
