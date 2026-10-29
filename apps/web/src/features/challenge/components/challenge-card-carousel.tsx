"use client";

import { useState, type UIEvent } from "react";

import type { MyChallengeCardData } from "../types";
import ChallengeCard from "./challenge-card/challenge-card";

type ChallengeCardCarouselProps = {
  challenges: MyChallengeCardData[];
};

/**
 * 내 챌린지 카드를 가로로 넘기는 목록과 페이지 점.
 * 화면 좌우 여백(24px)까지 스크롤 영역으로 써서 다음 카드가 살짝 보이게 한다.
 */
export default function ChallengeCardCarousel({ challenges }: ChallengeCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 카드 너비가 모두 같으므로 스크롤 위치를 카드 한 장(+간격) 너비로 나눠 현재 카드를 구한다.
  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const list = event.currentTarget;
    const first = list.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap);
    setActiveIndex(Math.round(list.scrollLeft / step));
  };

  return (
    <section aria-label="내 챌린지" className="flex flex-col gap-5">
      <ul
        onScroll={handleScroll}
        className="scorll-bar-none flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden"
      >
        {challenges.map((challenge) => (
          <li key={challenge.id} className="w-full shrink-0 snap-start">
            <ChallengeCard challenge={challenge} className="h-full" />
          </li>
        ))}
      </ul>

      {challenges.length > 1 && (
        <div aria-hidden className="flex justify-center gap-2">
          {challenges.map((challenge, index) => (
            <span
              key={challenge.id}
              className={`h-2 rounded-full transition-[width] ${
                index === activeIndex ? "bg-object-boldest w-3.75" : "bg-object-subtler w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
