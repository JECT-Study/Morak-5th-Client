"use client";

import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "@jects/jds";

import IntroTab, { type ChallengeIntroData } from "./intro-tab";
import MembersTab, { type ChallengeMember } from "./members-tab";

const TABS = [
  { value: "certification", label: "인증" },
  { value: "members", label: "팀원" },
  { value: "intro", label: "소개" },
] as const;

type ChallengeDetailTabsProps = {
  intro: ChallengeIntroData;
  members: ChallengeMember[];
};

/**
 * 챌린지 상세 하단 탭(Figma "Tabs": 인증 · 팀원 · 소개). 탭을 누르면 아래 내용이 바뀐다.
 * JDS Tabs(radix 기반)라 방향키 이동·스크린리더 탭 안내가 기본으로 된다.
 */
export default function ChallengeDetailTabs({ intro, members }: ChallengeDetailTabsProps) {
  return (
    <TabsRoot defaultValue="certification" variant="header" isItemStretched>
      <TabsList>
        {TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* TODO: 인증 탭 시안이 나오면 내용을 만든다. */}
      <TabsContent value="certification">
        <TabPlaceholder name="인증" />
      </TabsContent>
      <TabsContent value="members">
        <MembersTab members={members} memberCount={intro.memberCount} capacity={intro.capacity} />
      </TabsContent>
      <TabsContent value="intro">
        <IntroTab {...intro} />
      </TabsContent>
    </TabsRoot>
  );
}

function TabPlaceholder({ name }: { name: string }) {
  return (
    <p className="text-label-md font-label-subtle text-object-assistive py-16 text-center">
      {name} 탭은 준비 중이에요.
    </p>
  );
}
