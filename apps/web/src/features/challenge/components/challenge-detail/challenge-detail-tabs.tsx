"use client";

import { Lock } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import IntroTab, { type ChallengeIntroData } from "./intro-tab";
import MembersTab, { type ChallengeMember } from "./members-tab";

const TABS = [
  { value: "certification", label: "인증" },
  { value: "members", label: "팀원" },
  { value: "intro", label: "소개" },
] as const;

type ChallengeDetailTabsProps = {
  intro: ChallengeIntroData;
  /** 팀원 목록. 참가자 API가 나오기 전에는 없어서 준비 중 안내를 보여 준다. */
  members?: ChallengeMember[];
  /** 시작 전(모집 중·시작 보류)이면 true. 인증 탭에 시작 후 열린다는 안내를 보여 준다. */
  notStarted?: boolean;
};

/**
 * 챌린지 상세 하단 탭(Figma "Tabs": 인증 · 팀원 · 소개). 탭을 누르면 아래 내용이 바뀐다.
 * radix Tabs라 방향키 이동·스크린리더 탭 안내가 기본으로 된다.
 */
export default function ChallengeDetailTabs({
  intro,
  members,
  notStarted = false,
}: ChallengeDetailTabsProps) {
  return (
    <Tabs defaultValue="certification">
      <TabsList>
        {TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="certification">
        {/* TODO: 시작 후 인증 탭(인증 피드)은 인증 API가 나오면 만든다. */}
        {notStarted ? (
          <CertificationLocked startDate={intro.startDate} />
        ) : (
          <TabPlaceholder name="인증" />
        )}
      </TabsContent>
      <TabsContent value="members">
        {members ? (
          <MembersTab members={members} memberCount={intro.memberCount} capacity={intro.capacity} />
        ) : (
          <TabPlaceholder name="팀원" />
        )}
      </TabsContent>
      <TabsContent value="intro">
        <IntroTab {...intro} />
      </TabsContent>
    </Tabs>
  );
}

function TabPlaceholder({ name }: { name: string }) {
  return (
    <p className="text-label-md font-label-normal text-fg-quaternary py-16 text-center">
      {name} 탭은 준비 중이에요.
    </p>
  );
}

/** "2026-10-26" → "10월 26일" */
const toMonthDay = (date: string) => {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
};

/** 시작 전 인증 탭. Figma "챌린지 상세 (진행중 x)· 인증 탭" */
function CertificationLocked({ startDate }: { startDate: string }) {
  return (
    <div className="px-6 pt-6">
      <div className="rounded-12 flex items-center gap-3 px-4 py-3">
        <span className="bg-surface-tertiary flex size-10 shrink-0 items-center justify-center rounded-full">
          <Lock aria-hidden className="text-fg-secondary size-6" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-body-sm font-body-normal text-fg-primary">
            인증은 챌린지 시작 후에 열려요.
          </p>
          <p className="text-label-sm text-fg-tertiary">
            {toMonthDay(startDate)} 시작 · 인증 탭이 자동으로 활성화돼요.
          </p>
        </div>
      </div>
    </div>
  );
}
