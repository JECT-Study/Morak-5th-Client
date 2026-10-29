import { Divider, Icon } from "@jects/jds";
import { Fragment, type ReactNode } from "react";

import CircleCheckIcon from "@/shared/ui/icons/circle-check-icon";
import UsersIcon from "@/shared/ui/icons/users-icon";

import { formatWon } from "../../utils";

type TeamStatsProps = {
  memberCount: number;
  successRate: number;
  depositAmount: number;
};

/** 팀 정보: 팀 인원 · 팀 누적 성공률 · 1인 보증금 */
export default function TeamStats({ memberCount, successRate, depositAmount }: TeamStatsProps) {
  const stats: { icon: ReactNode; value: string; label: string }[] = [
    { icon: <UsersIcon className="text-2xl" />, value: `${memberCount}명`, label: "팀 인원" },
    {
      icon: <CircleCheckIcon className="text-2xl" />,
      value: `${successRate}%`,
      label: "팀 누적 성공률",
    },
    { icon: <Icon name="coins" size="xl" />, value: formatWon(depositAmount), label: "1인 보증금" },
  ];

  return (
    <div className="bg-surface-deep rounded-10 flex py-4">
      {stats.map(({ icon, value, label }, index) => (
        <Fragment key={label}>
          {index > 0 && <Divider orientation="vertical" className="h-auto self-stretch" />}
          <div className="flex flex-1 flex-col items-center gap-0.5">
            <span className="text-object-alternative flex">{icon}</span>
            <p className="text-label-lg font-label-bold text-object-boldest">{value}</p>
            <p className="text-label-sm font-label-subtle text-object-alternative">{label}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
