import { Suspense } from "react";

import ChallengeDetail from "@/features/challenge/components/challenge-detail/challenge-detail";
import ChallengeMoreMenu from "@/features/challenge/components/challenge-detail/challenge-more-menu";
import AppHeader from "@/shared/layout/app-header";

export default function ChallengeDetailPage() {
  return (
    <>
      {/* 만들기·초대 링크 등 어디서 들어왔든 뒤로가기는 챌린지 목록으로 보낸다 */}
      <AppHeader
        nested
        title="챌린지 상세"
        backHref="/challenges"
        suffixAction={
          // 메뉴도 경로의 [id]와 내 참가 정보를 읽어서 Suspense 안에 둔다
          <Suspense>
            <ChallengeMoreMenu />
          </Suspense>
        }
      />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <ChallengeDetail />
      </Suspense>
    </>
  );
}
