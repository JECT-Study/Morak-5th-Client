import {
  CalendarDays,
  Camera,
  CircleCheck,
  Clock3,
  Coins,
  Info,
  Target,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { formatPeriodWithDuration } from "../../utils";

export type ChallengeIntroData = {
  /** 챌린지 소개(본문). 없으면 카드를 그리지 않는다. */
  description: string | null;
  /** "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
  /** 인증 시간. 예) "매일 05:00 ~ 06:00" */
  certificationTime: string;
  /** 인증 방식. 예) "사진 인증" */
  verificationMethod: string;
  /** 공동 미션. 예) "매일 10쪽 읽기" */
  commonMission: string;
  capacity: number;
  memberCount: number;
  /** 1인당 참여 포인트. 0이면 포인트 없는 챌린지 */
  pointAmount: number;
  /** 인증 규칙(판정 기준) */
  rules: string[];
  /** 참여 시 유의사항 */
  notices: string[];
};

/** 챌린지 상세 "소개" 탭(Figma "intro body"). 소개·기본 정보·규칙·유의사항 카드를 세로로 쌓는다. */
export default function IntroTab({
  description,
  startDate,
  endDate,
  certificationTime,
  verificationMethod,
  commonMission,
  capacity,
  memberCount,
  pointAmount,
  rules,
  notices,
}: ChallengeIntroData) {
  return (
    <div className="bg-surface-secondary flex flex-col gap-3 p-4">
      {description && (
        <IntroCard title="챌린지 소개">
          <p className="text-body-sm font-body-normal text-fg-primary break-keep whitespace-pre-line">
            {description}
          </p>
        </IntroCard>
      )}

      <IntroCard title="기본 정보">
        <dl className="flex flex-col gap-3">
          <InfoRow icon={<CalendarDays className="size-5" />} title="진행 기간">
            {formatPeriodWithDuration(startDate, endDate)}
          </InfoRow>
          <InfoRow icon={<Target className="size-5" />} title="공동 미션">
            {commonMission}
          </InfoRow>
          <InfoRow icon={<Clock3 className="size-5" />} title="인증 시간">
            {certificationTime}
          </InfoRow>
          <InfoRow icon={<Camera className="size-5" />} title="인증 방식">
            {verificationMethod}
          </InfoRow>
          <InfoRow icon={<Users className="size-5" />} title="모집 인원">
            최대 {capacity}명 (현재 {memberCount}명)
          </InfoRow>
          {pointAmount > 0 && (
            // Figma 문구는 "보증금"이지만 위키 규칙상 "참여 포인트"로 쓴다.
            <InfoRow icon={<Coins className="size-5" />} title="참여 포인트">
              {pointAmount.toLocaleString("ko-KR")}P (완주 시 반환 규칙 적용)
            </InfoRow>
          )}
        </dl>
      </IntroCard>

      {/* TODO: 판정 방식·퇴장 기준·포인트 반환 규칙(위키 5.3)은 상세 API에 없어 나오면 추가한다. */}
      <IntroCard title="인증 규칙">
        <BulletList
          items={rules}
          icon={<CircleCheck className="size-5" />}
          iconClassName="text-success"
        />
      </IntroCard>

      <IntroCard title="참여 시 유의사항">
        <BulletList
          items={notices}
          icon={<Info className="size-5" />}
          iconClassName="text-fg-tertiary"
        />
      </IntroCard>
    </div>
  );
}

/** 흰 카드 + 제목 */
function IntroCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface-primary rounded-12 flex flex-col gap-3 p-4">
      <h3 className="text-label-lg font-label-strong text-fg-primary">{title}</h3>
      {children}
    </section>
  );
}

/** 아이콘 + 작은 제목 + 값 (Figma "Info row") */
function InfoRow({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="text-fg-tertiary flex size-5 shrink-0 items-center justify-center"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <dt className="text-label-sm font-label-normal text-fg-tertiary">{title}</dt>
        <dd className="text-body-sm font-body-normal text-fg-primary">{children}</dd>
      </div>
    </div>
  );
}

/** 아이콘 불릿 목록 (Figma "bullet") */
function BulletList({
  items,
  icon,
  iconClassName,
}: {
  items: string[];
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span
            aria-hidden
            className={`flex size-5 shrink-0 items-center justify-center ${iconClassName}`}
          >
            {icon}
          </span>
          <span className="text-body-sm font-body-normal text-fg-primary min-w-0 flex-1">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
