import { Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/shared/ui/button";

/**
 * 참여 중인 챌린지가 없을 때 홈에 보여주는 안내(Figma "챌린지 카드" 빈 상태).
 * Figma는 숨긴 "오늘의 인증" 줄(2+20px)과 그 아래 간격(20px) 자리를 비워 두므로 위에 42px을 띄운다.
 */
export default function MyChallengesEmpty() {
  return (
    <section className="mt-[42px] flex w-full flex-col items-center gap-6 px-4 py-5 text-center">
      <Image src="/images/morak-character.svg" alt="" width={128} height={123} priority />
      <h2 className="text-title-1 font-title text-fg-primary">아직 참여중인 챌린지가 없어요</h2>
      <p className="text-label-lg font-label-normal text-fg-secondary">
        지금 관심 있는 챌린지를 찾아보거나
        <br />
        직접 만들어보세요.
        <br />
        작은 도전이 꾸준한 변화를 만들어줄거에요.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button asChild fullWidth>
          <Link href="/challenges">
            <Search aria-hidden />
            챌린지 찾아보기
          </Link>
        </Button>
        {/* TODO: 챌린지 유형(데일리/프로젝트) 선택 화면이 정해지면 그쪽으로 보낸다. */}
        <Button asChild variant="outline" fullWidth>
          <Link href="/challenges/new/daily">
            <Plus aria-hidden />
            직접 만들기
          </Link>
        </Button>
      </div>
    </section>
  );
}
