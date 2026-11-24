import { notFound } from "next/navigation";
import { Suspense } from "react";

import ReviewDetail from "@/features/admin-review/components/review-detail";

export default async function AdminReviewDetailPage({
  params,
}: PageProps<"/admin/[certificationId]">) {
  const { certificationId } = await params;
  const id = Number(certificationId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  return (
    <Suspense>
      <ReviewDetail certificationId={id} />
    </Suspense>
  );
}
