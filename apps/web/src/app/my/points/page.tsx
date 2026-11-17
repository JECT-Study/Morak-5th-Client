import PointHistory from "@/features/point/components/point-history";
import AppHeader from "@/shared/layout/app-header";

export default function PointHistoryPage() {
  return (
    <>
      <AppHeader nested title="포인트 내역" />
      <PointHistory />
    </>
  );
}
