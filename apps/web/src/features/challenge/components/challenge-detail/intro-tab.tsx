import { Icon } from "@jects/jds";
import type { ReactNode } from "react";

import CameraIcon from "@/shared/ui/icons/camera-icon";
import CircleCheckIcon from "@/shared/ui/icons/circle-check-icon";
import UsersIcon from "@/shared/ui/icons/users-icon";

import { formatPeriodWithWeeks } from "../../utils";

export type ChallengeIntroData = {
  /** 챌린지 소개(본문) */
  description: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
  durationWeeks: number;
  /** 인증 시간. 예) "매일 05:00 ~ 06:00" */
  certificationTime: string;
  /** 인증 방식(판정 기준). 예) "기상 직후 시간이 보이는 사진 인증" */
  verificationMethod: string;
  capacity: number;
  memberCount: number;
  /** 1인당 참여 포인트. 0이면 포인트 없는 챌린지 */
  pointAmount: number;
  /** 인증 및 포인트 반환 규칙 */
  rules: string[];
  /** 참여 시 유의사항 */
  notices: string[];
};

/** 챌린지 상세 "소개" 탭(Figma "intro body"). 소개·기본 정보·규칙·유의사항 카드를 세로로 쌓는다. */
export default function IntroTab({
  description,
  startDate,
  endDate,
  durationWeeks,
  certificationTime,
  verificationMethod,
  capacity,
  memberCount,
  pointAmount,
  rules,
  notices,
}: ChallengeIntroData) {
  return (
    <div className="bg-surface-deep flex flex-col gap-3 p-4">
      <IntroCard title="챌린지 소개">
        <p className="text-body-sm font-body-normal text-object-bold break-keep">{description}</p>
      </IntroCard>

      <IntroCard title="기본 정보">
        <dl className="flex flex-col gap-3">
          <InfoRow icon={<Icon name="calendar-days" size="md" />} title="진행 기간">
            {formatPeriodWithWeeks(startDate, endDate, durationWeeks)}
          </InfoRow>
          <InfoRow icon={<Icon name="clock-3" size="md" />} title="인증 시간">
            {certificationTime}
          </InfoRow>
          <InfoRow icon={<CameraIcon className="text-xl" />} title="인증 방식">
            {verificationMethod}
          </InfoRow>
          <InfoRow icon={<UsersIcon className="text-xl" />} title="모집 인원">
            최대 {capacity}명 (현재 {memberCount}명)
          </InfoRow>
          {pointAmount > 0 && (
            // Figma 문구는 "보증금"이지만 위키 규칙상 "참여 포인트"로 쓴다.
            <InfoRow icon={<Icon name="coins" size="md" />} title="참여 포인트">
              {pointAmount.toLocaleString("ko-KR")}P (완주 시 반환 규칙 적용)
            </InfoRow>
          )}
        </dl>
      </IntroCard>

      <IntroCard title="인증 및 반환 규칙">
        <BulletList
          items={rules}
          icon={<CircleCheckIcon className="text-xl" />}
          iconClassName="text-(--color-semantic-feedback-positive-alternative)"
        />
      </IntroCard>

      <IntroCard title="참여 시 유의사항">
        <BulletList
          items={notices}
          icon={<Icon name="info" size="md" />}
          iconClassName="text-object-alternative"
        />
      </IntroCard>
    </div>
  );
}

/** 흰 카드 + 제목 */
function IntroCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface-standard rounded-12 flex flex-col gap-3 p-4">
      <h3 className="text-label-lg font-label-bold text-object-boldest">{title}</h3>
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
        className="text-object-alternative flex size-5 shrink-0 items-center justify-center"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <dt className="text-label-sm font-label-subtle text-object-alternative">{title}</dt>
        <dd className="text-body-sm font-body-normal text-object-boldest">{children}</dd>
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
          <span className="text-body-sm font-body-normal text-object-bold min-w-0 flex-1">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
