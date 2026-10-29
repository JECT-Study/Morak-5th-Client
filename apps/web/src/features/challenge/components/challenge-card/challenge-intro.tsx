import { ContentBadge, Icon } from "@jects/jds";
import Link from "next/link";

import LockKeyholeIcon from "@/shared/ui/icons/lock-keyhole-icon";

type ChallengeIntroProps = {
  id: number;
  category: string;
  isPrivate: boolean;
  title: string;
  description: string;
};

/** 카드 상단: 카테고리·공개 여부 배지, 제목, 설명, 상세 링크 */
export default function ChallengeIntro({
  id,
  category,
  isPrivate,
  title,
  description,
}: ChallengeIntroProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <ContentBadge hierarchy="primary" size="sm">
          {category}
        </ContentBadge>
        {isPrivate && (
          <ContentBadge badgeStyle="outlined" size="sm">
            <span className="flex items-center gap-0.5">
              <LockKeyholeIcon className="text-xs" />
              비공개
            </span>
          </ContentBadge>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-title-1 font-title-subtle text-object-boldest">{title}</h2>
        <p className="text-label-lg font-label-subtle text-object-normal">{description}</p>
        <Link
          href={`/challenges/${id}`}
          className="text-label-xs font-label-subtle text-object-alternative flex items-center justify-end gap-1"
        >
          챌린지 상세보기
          <Icon name="chevron-right" size="sm" />
        </Link>
      </div>
    </>
  );
}
