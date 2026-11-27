import { Mail } from "lucide-react";
import Link from "next/link";

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
          <div className="flex">
            <IconButton asChild aria-label="초대코드 입력">
              <Link href="/invite">
                <Mail aria-hidden />
              </Link>
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
