import { Suspense } from "react";

import ReviewList from "@/features/admin-review/components/review-list";

/** 운영진 인증 검수 목록(위키 §4.10). 필터는 URL 쿼리를 읽으므로 Suspense로 감싼다. */
export default function AdminReviewsPage() {
  return (
    <Suspense>
      <ReviewList />
    </Suspense>
  );
}
