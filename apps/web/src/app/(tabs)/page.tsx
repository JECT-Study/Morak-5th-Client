import { BookKey } from "lucide-react";

import MyChallengesSection from "@/features/challenge/components/my-challenges-section";
import NotificationBell from "@/features/notification/components/notification-bell";
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
            <NotificationBell />
          </div>
        }
      />
      <main className="flex flex-col gap-5 pt-0.5 pb-5">
        <MyChallengesSection />
      </main>
    </>
  );
}
