import { BlockButton, Divider } from "@jects/jds";
import Link from "next/link";

import CameraIcon from "@/shared/ui/icons/camera-icon";

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
      className={`bg-surface-standard border-stroke-subtle rounded-12 flex flex-col gap-3 border p-5 ${className ?? ""}`}
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
      <Divider />
      <TodayCertifications
        memberCount={challenge.memberCount}
        certifications={challenge.todayCertifications}
      />
      {/* camera는 JDS 패키지에 없어 prefixIcon 대신 Figma SVG를 직접 넣는다. 크기는 lg 버튼의 아이콘 크기(18px) */}
      <BlockButton asChild size="lg">
        <Link href={`/challenges/${challenge.id}/certifications/new`}>
          <CameraIcon className="text-[18px]" />
          지금 인증하기
        </Link>
      </BlockButton>
    </article>
  );
}
