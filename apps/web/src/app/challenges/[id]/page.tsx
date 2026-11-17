import { Suspense } from "react";

import ChallengeDetail from "@/features/challenge/components/challenge-detail/challenge-detail";
import AppHeader from "@/shared/layout/app-header";

export default function ChallengeDetailPage() {
  return (
    <>
      <AppHeader nested title="챌린지 상세" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <ChallengeDetail />
      </Suspense>
    </>
  );
}
