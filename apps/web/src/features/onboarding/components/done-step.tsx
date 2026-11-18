import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";

const READY_IMAGE = { src: "/images/morak-ready.png", alt: "", width: 220, height: 220 } as const;

/**
 * 완료 화면은 마지막 단계에서야 그려져서, 그때 이미지를 받기 시작하면 늦게 뜬다.
 * 온보딩을 시작할 때 next/image가 쓸 주소(srcSet)와 같은 주소로 미리 받아 둔다.
 */
export function preloadReadyImage() {
  const { props } = getImageProps(READY_IMAGE);
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "low",
  });
}

/**
 * 온보딩 마지막 화면(Figma "온보딩_준비완료").
 * TODO: 첫 가입 포인트 안내는 Figma "포인트" 화면이 정해지면 따로 만든다(시안에 "아직 구현 못 함").
 */
export default function DoneStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Image {...READY_IMAGE} alt="" loading="eager" />
      <div className="flex flex-col gap-1">
        <h2 className="text-title-3 font-title text-fg-primary">모락을 시작할 준비가 되었어요!</h2>
        <p className="text-body-md font-body-normal text-fg-secondary">
          이제 함께 도전할 챌린지를 찾아보세요.
        </p>
      </div>
    </div>
  );
}
