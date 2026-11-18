import { CircleCheck, Coins, Users } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { formatPoint } from "@/features/point/format";
import { Separator } from "@/shared/ui/separator";

type TeamStatsProps = {
  memberCount: number;
  /** 인증 집계가 없으면 null("-") */
  successRate: number | null;
  depositAmount: number;
};

/** 팀 정보: 팀 인원 · 팀 누적 성공률 · 1인 참여 포인트(Figma 문구는 "보증금", 위키 규칙상 "참여 포인트") */
export default function TeamStats({ memberCount, successRate, depositAmount }: TeamStatsProps) {
  const stats: { icon: ReactNode; value: string; label: string }[] = [
    { icon: <Users aria-hidden className="size-6" />, value: `${memberCount}명`, label: "팀 인원" },
    {
      icon: <CircleCheck aria-hidden className="size-6" />,
      value: successRate === null ? "-" : `${successRate}%`,
      label: "팀 누적 성공률",
    },
    {
      icon: <Coins aria-hidden className="size-6" />,
      value: formatPoint(depositAmount),
      label: "1인 참여 포인트",
    },
  ];

  return (
    <div className="bg-surface-secondary rounded-10 flex py-4">
      {stats.map(({ icon, value, label }, index) => (
        <Fragment key={label}>
          {index > 0 && <Separator orientation="vertical" />}
          <div className="flex flex-1 flex-col items-center gap-0.5">
            <span className="text-fg-tertiary flex">{icon}</span>
            <p className="text-label-lg font-label-strong text-fg-primary">{value}</p>
            <p className="text-label-sm font-label-normal text-fg-tertiary">{label}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
