import { Suspense } from "react";

import ParticipationRequestsScreen from "@/features/participation-request/components/participation-requests-screen";
import AppHeader from "@/shared/layout/app-header";

export default function ManageRequestsPage() {
  return (
    <>
      <AppHeader nested title="참여 신청 관리" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <ParticipationRequestsScreen />
      </Suspense>
    </>
  );
}
