import { BlockButton } from "@jects/jds";
import Image from "next/image";
import Link from "next/link";

/**
 * 참여 중인 챌린지가 없을 때 홈에 보여주는 안내(Figma "챌린지 카드" 빈 상태).
 * Figma는 숨긴 "오늘의 인증" 줄(2+20px)과 그 아래 간격(20px) 자리를 비워 두므로 위에 42px을 띄운다.
 */
export default function MyChallengesEmpty() {
  return (
    <section className="mx-auto mt-[42px] flex w-full max-w-[327px] flex-col items-center gap-6 p-5 text-center">
      <Image src="/images/morak-character.svg" alt="" width={128} height={123} priority />
      <h2 className="text-title-1 font-title-subtle text-object-boldest">
        아직 참여중인 챌린지가 없어요
      </h2>
      <p className="text-label-lg font-label-subtle text-object-neutral">
        지금 관심 있는 챌린지를 찾아보거나
        <br />
        직접 만들어보세요.
        <br />
        작은 도전이 꾸준한 변화를 만들어줄거에요.
      </p>
      <div className="flex w-full flex-col gap-2">
        <BlockButton asChild size="lg" hierarchy="accent" prefixIcon="search">
          <Link href="/challenges">챌린지 찾아보기</Link>
        </BlockButton>
        {/* TODO: 챌린지 유형(데일리/프로젝트) 선택 화면이 정해지면 그쪽으로 보낸다. */}
        <BlockButton
          asChild
          size="lg"
          hierarchy="primary"
          variant="outlined"
          prefixIcon="plus"
          className="bg-(--color-semantic-surface-shallow)"
        >
          <Link href="/challenges/new/daily">직접 만들기</Link>
        </BlockButton>
      </div>
    </section>
  );
}
