import { Suspense } from "react";

import JudgmentScreen from "@/features/certification/components/judgment-screen";
import AppHeader from "@/shared/layout/app-header";

export default function ManageCertificationsPage() {
  return (
    <>
      <AppHeader nested title="인증 관리" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <JudgmentScreen />
      </Suspense>
    </>
  );
}
