import { Suspense } from "react";

import ChallengeResult from "@/features/challenge-result/components/challenge-result";
import AppHeader from "@/shared/layout/app-header";

export default function ChallengeResultsPage() {
  return (
    <div className="bg-background-primary flex flex-1 flex-col">
      <AppHeader nested centered title="챌린지 결과" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <ChallengeResult />
      </Suspense>
    </div>
  );
}
