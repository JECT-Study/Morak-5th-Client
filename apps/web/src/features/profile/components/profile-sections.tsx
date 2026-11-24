"use client";

import { Info, Link as LinkIcon, UserRound } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { INTERESTS } from "@/features/onboarding/profile";

import type { UserProfile } from "../types";

/**
 * 프로필 화면 조각(위키 6.2·6.5·6.6). 마이페이지와 (나중에) 타인 프로필이 같이 쓴다.
 * 순서: 프로필 → 모락이·개인 인증률 → 누적 완주·중도 실패 → 메달
 */

const INTEREST_LABEL = Object.fromEntries(INTERESTS.map(({ value, label }) => [value, label]));

/**
 * 사진·닉네임·한 줄 소개·링크·관심 분야. 소개·링크는 입력한 경우에만 보인다.
 * action은 본인 화면의 "정보 수정"처럼 프로필 맨 아래에 붙일 버튼이다(타인 프로필은 없음).
 */
export function ProfileHeader({ profile, action }: { profile: UserProfile; action?: ReactNode }) {
  return (
    <section aria-label="프로필" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="bg-surface-tertiary text-fg-quaternary relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {profile.profileImageUrl ? (
            // TODO: 이미지 저장소 도메인이 정해지면 next.config의 images.remotePatterns에 등록하고 최적화를 켠다.
            <Image
              src={profile.profileImageUrl}
              alt=""
              fill
              sizes="64px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <UserRound aria-hidden className="size-8" />
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-title-2 font-title text-fg-primary truncate">{profile.nickname}</p>
          {profile.bio && (
            <p className="text-body-sm font-body-normal text-fg-secondary break-keep">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
      {profile.profileLinkUrl && (
        <a
          href={profile.profileLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-label-md font-label-normal text-fg-info flex min-w-0 items-center gap-1"
        >
          <LinkIcon aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{profile.profileLinkUrl}</span>
        </a>
      )}
      {profile.interests.length > 0 && (
        <ul aria-label="관심 분야" className="flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <li
              key={interest}
              className="bg-surface-secondary text-fg-secondary text-label-sm font-label-normal rounded-max px-2.5 py-1"
            >
              {INTEREST_LABEL[interest] ?? interest}
            </li>
          ))}
        </ul>
      )}
      {action}
    </section>
  );
}

const RATE_DESCRIPTION =
  "개인 인증률은 내가 해야 했던 인증 중 승인된 인증의 비율이에요. 사진을 제출하지 않은 날도 포함하며, 인증 의무가 면제된 날은 제외해요. 팀 달성률과는 달라요.";
const COUNT_DESCRIPTION =
  "완주는 퇴장 없이 예정 기간까지 참여한 챌린지, 중도 실패는 인증 실패가 쌓여 퇴장한 챌린지예요. 인원 부족으로 조기 종료된 챌린지는 세지 않아요.";

/**
 * 모락이 + 개인 인증률, 누적 완주·중도 실패(위키 6.5). 단계는 서버 값 그대로 쓴다.
 * 인증 기록이 없으면 0%·1단계 대신 "인증 기록 없음"과 기본 모락이를 보여 준다.
 * TODO: 모락이 단계별 이미지가 나오면 단계마다 바꾼다. 지금은 기본 모락이 하나다.
 */
export function RecordSection({ profile }: { profile: UserProfile }) {
  const hasRecord = profile.hasCertificationRecord && profile.certificationRate !== null;

  return (
    <section aria-label="인증 기록" className="flex flex-col gap-3">
      <div className="bg-surface-secondary rounded-16 flex items-center gap-4 p-4">
        <Image src="/images/morak-character.svg" alt="" width={64} height={61} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <LabelWithInfo label="개인 인증률" description={RATE_DESCRIPTION} />
          {hasRecord ? (
            <>
              <p className="text-title-3 font-title text-fg-brand-strong">
                {profile.certificationRate}%
              </p>
              {profile.morakiStage !== null && (
                <p className="text-label-sm font-label-normal text-fg-tertiary">
                  모락이 {profile.morakiStage}단계
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-title-1 font-title text-fg-primary">인증 기록 없음</p>
              <p className="text-label-sm font-label-normal text-fg-tertiary break-keep">
                챌린지에 참여하고 모락이를 활성화해 보세요!
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-surface-secondary rounded-16 flex flex-col gap-2 p-4">
        <LabelWithInfo label="챌린지 기록" description={COUNT_DESCRIPTION} />
        <dl className="flex gap-3">
          <CountItem label="누적 완주" value={profile.completedCount} />
          <CountItem label="중도 실패" value={profile.midwayFailCount} />
        </dl>
      </div>
    </section>
  );
}

/** 획득한 메달 3자리(위키 6.6). 없으면 안내 문구. */
export function MedalSection({ profile }: { profile: UserProfile }) {
  const medals = profile.medals.slice(0, 3);
  return (
    <section aria-labelledby="medal-title" className="flex flex-col gap-2">
      <h2 id="medal-title" className="text-title-1 font-title text-fg-primary">
        메달
      </h2>
      {medals.length === 0 ? (
        <p className="bg-surface-secondary rounded-16 text-body-sm font-body-normal text-fg-tertiary p-4 text-center break-keep">
          아직 획득한 메달이 없어요. 첫 챌린지를 완주하고 첫 메달을 받아보세요!
        </p>
      ) : (
        // TODO: 메달 상세 화면이 정해지면 "메달 상세보기"를 붙인다.
        <ul className="grid grid-cols-3 gap-2">
          {medals.map((medal) => (
            <li
              key={medal.code}
              className="bg-surface-secondary rounded-16 flex flex-col items-center gap-1 p-3"
            >
              {medal.iconUrl ? (
                <Image src={medal.iconUrl} alt="" width={48} height={48} unoptimized />
              ) : (
                <span aria-hidden className="bg-surface-tertiary size-12 rounded-full" />
              )}
              <span className="text-label-sm font-label-normal text-fg-secondary text-center">
                {medal.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CountItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-primary rounded-12 flex flex-1 flex-col gap-0.5 p-3">
      <dt className="text-label-sm font-label-normal text-fg-tertiary">{label}</dt>
      <dd className="text-title-2 font-title text-fg-primary">{value}회</dd>
    </div>
  );
}

/** 제목 옆 설명 아이콘. 누르면 아래에 설명을 펼친다. */
function LabelWithInfo({ label, description }: { label: string; description: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-label-md font-label-normal text-fg-secondary">{label}</span>
        <button
          type="button"
          aria-label={`${label} 설명`}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="text-fg-tertiary focus-visible:ring-line-focus rounded-max flex size-6 items-center justify-center focus-visible:ring-2 focus-visible:outline-none"
        >
          <Info aria-hidden className="size-4" />
        </button>
      </div>
      {open && (
        <p className="text-body-2xs font-body-normal text-fg-tertiary break-keep">{description}</p>
      )}
    </div>
  );
}
