import { Spinner } from "@/shared/ui/spinner";

/**
 * 페이지를 옮길 때 다음 화면을 서버에서 준비하는 동안 보이는 대기 화면.
 * 화면 안의 목록·카드는 각 화면이 Skeleton으로 따로 보여 준다.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner size={56} />
    </div>
  );
}
