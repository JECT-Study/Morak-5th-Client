import Image from "next/image";

/**
 * 온보딩 마지막 화면(Figma "온보딩_준비완료").
 * TODO: 첫 가입 포인트 안내는 Figma "포인트" 화면이 정해지면 따로 만든다(시안에 "아직 구현 못 함").
 */
export default function DoneStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Image src="/images/morak-ready.png" alt="" width={220} height={220} priority />
      <div className="flex flex-col gap-1">
        <h2 className="text-title-3 font-title text-fg-primary">모락을 시작할 준비가 되었어요!</h2>
        <p className="text-body-md font-body-normal text-fg-secondary">
          이제 함께 도전할 챌린지를 찾아보세요.
        </p>
      </div>
    </div>
  );
}
