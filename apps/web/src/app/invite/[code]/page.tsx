import { Suspense } from "react";

import { InviteLink } from "@/features/challenge/components/invite-entry";
import AppHeader from "@/shared/layout/app-header";

export default function InvitePage() {
  return (
    <>
      <AppHeader nested title="초대" backHref="/" />
      {/* 경로의 [code]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <InviteLink />
      </Suspense>
    </>
  );
}
