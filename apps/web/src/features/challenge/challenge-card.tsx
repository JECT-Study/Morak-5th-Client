import LockKeyholeIcon from "@/shared/ui/icons/lock-keyhole-icon";
import { ContentBadge } from "@jects/jds";

export default function ChallengeCard() {
  return (
    <div className="bg-surface-standard border-stroke-subtle rounded-12 flex flex-col justify-center p-5">
      <div className="flex justify-between">
        <ContentBadge hierarchy="primary" size="sm">
          생활습관
        </ContentBadge>
        <ContentBadge badgeStyle="outlined" size="sm">
          <span className="flex items-center gap-0.5">
            <LockKeyholeIcon className="text-xs" />
            비공개
          </span>
        </ContentBadge>
      </div>
    </div>
  );
}
