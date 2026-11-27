import { SquarePlus } from "lucide-react";

import LoginRequiredLink from "@/features/auth/components/login-required-link";
import RecruitingChallenges from "@/features/challenge/components/recruiting/recruiting-challenges";
import AppHeader from "@/shared/layout/app-header";
import { IconButton } from "@/shared/ui/icon-button";

export default function RecruitingChallengesPage() {
  return (
    <>
      <AppHeader
        title="모집 중"
        suffixAction={
          // TODO: 챌린지 만들기 진입(데일리·프로젝트 선택) 시안이 나오면 바꾼다. 지금은 데일리로 간다.
          <IconButton asChild aria-label="챌린지 만들기">
            <LoginRequiredLink href="/challenges/new/daily">
              <SquarePlus aria-hidden />
            </LoginRequiredLink>
          </IconButton>
        }
      />
      <RecruitingChallenges />
    </>
  );
}
