"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

import type { MyChallengeCardData } from "../types";
import ChallengeCard from "./challenge-card/challenge-card";

type ChallengeCardCarouselProps = {
  challenges: MyChallengeCardData[];
};

/**
 * 내 챌린지 카드를 가로로 넘기는 목록과 페이지 점.
 * Embla로 터치·마우스 드래그를 모두 받는다(브라우저 기본 가로 스크롤은 PC 마우스로 끌 수 없다).
 * 화면 좌우 여백(16px)을 남기고 다음 카드가 살짝 보이게 한다. 점을 누르면 그 카드로 이동한다.
 */
export default function ChallengeCardCarousel({ challenges }: ChallengeCardCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <section aria-label="내 챌린지" aria-roledescription="carousel" className="flex flex-col gap-5">
      <div ref={emblaRef} className="overflow-hidden px-4">
        <ul className="flex gap-3">
          {challenges.map((challenge, index) => (
            <li
              key={challenge.id}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${challenges.length}`}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <ChallengeCard challenge={challenge} className="h-full" />
            </li>
          ))}
        </ul>
      </div>

      {challenges.length > 1 && (
        <div className="flex justify-center gap-2">
          {challenges.map((challenge, index) => (
            <button
              key={challenge.id}
              type="button"
              aria-label={`${index + 1}번째 챌린지로 이동`}
              aria-current={index === activeIndex}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-[width] ${
                index === activeIndex ? "bg-fg-primary w-3.75" : "bg-fg-disabled w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
