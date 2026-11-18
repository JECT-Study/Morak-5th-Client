import { Bell, BookKey } from "lucide-react";
import Link from "next/link";

import MyChallengesSection from "@/features/challenge/components/my-challenges-section";
import AppHeader from "@/shared/layout/app-header";
import { IconButton } from "@/shared/ui/icon-button";

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
        <MyChallengesSection />
      </main>
    </>
  );
}
