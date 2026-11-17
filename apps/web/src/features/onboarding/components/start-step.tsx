import Image from "next/image";

/** 온보딩 시작 화면(Figma "온보딩_시작"). 환영 문구 아래에 모락이를 보여 준다. */
export default function StartStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-3 font-title text-fg-primary">모락에 오신 것을 환영해요!</h2>
        <p className="text-body-md font-body-normal text-fg-secondary">
          함께 도전할 준비를 해볼까요?
        </p>
      </div>
      <div className="flex size-55 items-center justify-center">
        <Image src="/images/morak-welcome.svg" alt="" width={172} height={192} priority />
      </div>
    </div>
  );
}
