import Image from "next/image";

/** 첫 가입 포인트. TODO: 포인트 API가 나오면 실제 지급 결과로 바꾼다. */
const SIGN_UP_POINT = 10_000;

/** 온보딩 3단계: 준비 완료와 첫 가입 포인트 안내 */
export default function DoneStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Image src="/images/morak-character.svg" alt="" width={128} height={123} priority />
      <div className="flex flex-col gap-2">
        <h2 className="text-title-1 font-title-subtle text-object-boldest">
          모락을 시작할 준비가 되었어요!
        </h2>
        <p className="text-label-lg font-label-subtle text-object-neutral">
          이제 함께 도전할 챌린지를 찾아보세요.
        </p>
      </div>
      <div className="bg-surface-shallow rounded-12 flex w-full flex-col gap-1 px-5 py-6">
        <p className="text-label-md font-label-subtle text-object-neutral">첫 가입 포인트</p>
        <p className="text-title-3 font-title-normal text-object-boldest">
          {SIGN_UP_POINT.toLocaleString("ko-KR")}P
        </p>
        <p className="text-label-md font-label-subtle text-object-neutral">지급되었어요.</p>
      </div>
      <p className="text-label-sm font-label-subtle text-object-alternative">
        포인트를 거는 공개 챌린지에 사용할 수 있어요.
      </p>
    </div>
  );
}
