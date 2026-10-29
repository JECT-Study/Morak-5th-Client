import { DotBadge, IconButton } from "@jects/jds";
import Link from "next/link";

import AppHeader from "@/shared/layout/app-header";
import ScreenPlaceholder from "@/shared/layout/screen-placeholder";
import BookKeyIcon from "@/shared/ui/icons/book-key-icon";
import SvgIconButton from "@/shared/ui/svg-icon-button";

export default function MyChallengesPage() {
  return (
    <>
      <AppHeader
        title="챌린지 다이어리"
        suffixAction={
          // Figma는 버튼마다 40×40 영역에 24px 아이콘을 둔다. 버튼은 JDS 크기(24px) 그대로 두고 영역만 감싼다.
          <div className="flex gap-2">
            <span className="flex size-10 items-center justify-center">
              {/* book-key는 JDS 패키지에 없어 Figma SVG를 쓴다. TODO: 이동할 화면 미정 */}
              <SvgIconButton aria-label="챌린지 목록">
                <BookKeyIcon />
              </SvgIconButton>
            </span>
            <span className="relative flex size-10 items-center justify-center">
              <IconButton asChild icon="bell" size="xl" hierarchy="tertiary" aria-label="알림">
                <Link href="/notifications" />
              </IconButton>
              {/* TODO: 안 읽은 알림이 있을 때만 보인다. GET /notifications/unread-count 연결 */}
              <DotBadge size="sm" className="pointer-events-none absolute top-2 left-6" />
            </span>
          </div>
        }
      />
      {/* TODO: 남은 인증 수는 내 참가 목록 API 연결 후 계산한다. */}
      <p className="text-object-normal px-6 pt-0.5 text-sm leading-5 font-[440]">
        오늘의 인증 · 1개 남음
      </p>
      <ScreenPlaceholder name="내 챌린지" />
    </>
  );
}
