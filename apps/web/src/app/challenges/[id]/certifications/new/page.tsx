import { Suspense } from "react";

import CertificationSubmit from "@/features/certification/components/certification-submit";
import AppHeader from "@/shared/layout/app-header";

export default function NewCertificationPage() {
  return (
    <div className="bg-background-primary flex flex-1 flex-col">
      <AppHeader nested centered title="오늘 인증" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <CertificationSubmit />
      </Suspense>
    </div>
  );
}
