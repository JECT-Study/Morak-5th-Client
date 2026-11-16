import { Bell, BookKey } from "lucide-react";
import Link from "next/link";

import ChallengeCardCarousel from "@/features/challenge/components/challenge-card-carousel";
import MyChallengesEmpty from "@/features/challenge/components/my-challenges-empty";
import type { MyChallengeCardData } from "@/features/challenge/types";
import { myChallengesMock } from "@/mocks/data/my-challenges";
import AppHeader from "@/shared/layout/app-header";
import { IconButton } from "@/shared/ui/icon-button";

// TODO: GET /users/me/participations 연결 전까지는 목 모드에서만 목 데이터를 쓰고, 그 외에는 빈 목록으로 둔다.
const challenges: MyChallengeCardData[] =
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ? myChallengesMock : [];

export default function MyChallengesPage() {
  return (
    <>
      <AppHeader
        title="챌린지 다이어리"
        suffixAction={
          <div className="flex gap-1">
            {/* TODO: 이동할 화면 미정 */}
            <IconButton aria-label="초대코드 입력">
              <BookKey aria-hidden />
            </IconButton>
            <span className="relative flex">
              <IconButton asChild aria-label="알림">
                <Link href="/notifications">
                  <Bell aria-hidden />
                </Link>
              </IconButton>
              {/* TODO: 안 읽은 알림이 있을 때만 보인다. GET /notifications/unread-count 연결. 보일 때는 aria-label에 "새 알림 있음"을 더한다. */}
              <span
                aria-hidden
                className="bg-surface-brand rounded-max pointer-events-none absolute top-2 right-2 size-2"
              />
            </span>
          </div>
        }
      />
      <main className="flex flex-col gap-5 pt-0.5 pb-5">
        {challenges.length === 0 ? (
          <MyChallengesEmpty />
        ) : (
          <>
            {/* TODO: 남은 인증 수는 내 참가 목록 API 연결 후 계산한다. */}
            <p className="text-label-md font-label-normal text-fg-secondary px-6">
              오늘의 인증 · 1개 남음
            </p>
            <ChallengeCardCarousel challenges={challenges} />
          </>
        )}
      </main>
    </>
  );
}
