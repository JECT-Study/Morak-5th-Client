"use client";

import {
  CircleCheck,
  Ellipsis,
  MessageSquareMore,
  Settings,
  Share2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import type { ComponentProps } from "react";

import { sendToApp } from "@/shared/native/bridge";
import { cn } from "@/shared/lib/utils";
import { IconButton } from "@/shared/ui/icon-button";

import { useParticipationRequests } from "@/features/participation-request/use-participation-requests";

import { useChallenge } from "../../use-challenge";
import { useMyRole } from "../../use-my-role";

/**
 * 챌린지 상세 헤더의 더보기(⋯) 메뉴. Figma "참고 · 방장 더보기 메뉴".
 * - 공통: 채팅방 이동(참여 확정된 사람만), 공유하기
 * - 관리자 메뉴: 방장에게만 보인다.
 * - 참여 신청 관리 옆에는 대기 건수 배지를 붙인다(0건이면 배지만 숨김).
 * TODO: 인증 관리 대기 건수 배지는 인증 API가 생기면 붙인다.
 */
export default function ChallengeMoreMenu() {
  const { id } = useParams<{ id: string }>();
  const { data: challenge } = useChallenge(id);
  const myStatus = challenge?.myParticipationStatus ?? null;
  const { data: myRole } = useMyRole(id, myStatus !== null);
  const isHost = myRole === "HOST";
  // 무효 신청도 방장이 확인해야 해서 대기 건수에 넣는다.
  const { data: pendingRequests } = useParticipationRequests(id, "PENDING", isHost);
  const pendingCount = pendingRequests?.items.length ?? 0;

  if (!challenge) return null;

  const share = () => {
    const url = `${window.location.origin}/challenges/${challenge.id}`;
    if (sendToApp({ type: "SHARE", url, title: challenge.title })) return;
    if (navigator.share) {
      // 사용자가 공유 창을 닫아도 오류가 나므로 무시한다.
      navigator.share({ url, title: challenge.title }).catch(() => undefined);
      return;
    }
    // TODO: 토스트가 생기면 "링크를 복사했어요"를 띄운다.
    navigator.clipboard?.writeText(url).catch(() => undefined);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <IconButton aria-label="더보기">
          <Ellipsis aria-hidden />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          // 누른 버튼 쪽(Radix가 계산한 transform-origin)에서 펼쳐진다.
          className="bg-surface-primary border-line-subtle rounded-16 shadow-raised motion-safe:data-[state=open]:animate-dropdown-in motion-safe:data-[state=closed]:animate-dropdown-out z-20 flex w-[216px] origin-(--radix-dropdown-menu-content-transform-origin) flex-col border px-4 py-2"
        >
          {/* 채팅은 참여가 확정된(ACTIVE) 뒤부터 들어갈 수 있다(위키 7절) */}
          {myStatus === "ACTIVE" && (
            <MenuLink icon={MessageSquareMore} href={`/challenges/${id}/chat`}>
              채팅방 이동
            </MenuLink>
          )}
          <MenuItem icon={Share2} onSelect={share}>
            공유하기
          </MenuItem>
          {isHost && (
            <DropdownMenu.Group>
              <DropdownMenu.Label className="text-label-xs font-label-normal text-fg-tertiary">
                관리자 메뉴
              </DropdownMenu.Label>
              {/* TODO: 챌린지 설정 화면이 정해지면 연결한다 */}
              <MenuItem icon={Settings} disabled>
                챌린지 설정
              </MenuItem>
              <MenuLink
                icon={UserPlus}
                href={`/challenges/${id}/manage/requests`}
                count={pendingCount}
              >
                참여 신청 관리
              </MenuLink>
              <MenuLink icon={CircleCheck} href={`/challenges/${id}/manage/certifications`}>
                인증 관리
              </MenuLink>
            </DropdownMenu.Group>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** 메뉴 한 줄: 왼쪽 아이콘 24 + 글자. 좌우 8, 위아래 12, 간격 12 */
const ROW_CLASS = cn(
  "text-body-md font-body-normal text-fg-primary flex items-center gap-3 rounded-8 px-2 py-3 outline-none",
  "data-[highlighted]:bg-surface-secondary data-[disabled]:text-fg-disabled",
  "[&_svg]:size-6 [&_svg]:shrink-0",
);

type RowProps = { icon: LucideIcon; children: string };

function MenuItem({
  icon: Icon,
  children,
  ...props
}: RowProps & Omit<ComponentProps<typeof DropdownMenu.Item>, "children">) {
  return (
    <DropdownMenu.Item className={ROW_CLASS} {...props}>
      <Icon aria-hidden />
      {children}
    </DropdownMenu.Item>
  );
}

/** count가 1 이상이면 오른쪽에 건수 배지를 붙인다(0건이면 배지만 숨김). */
function MenuLink({
  icon: Icon,
  children,
  href,
  count = 0,
}: RowProps & { href: string; count?: number }) {
  return (
    <DropdownMenu.Item asChild className={ROW_CLASS}>
      <Link href={href}>
        <Icon aria-hidden />
        <span className="flex-1">{children}</span>
        {count > 0 && (
          <span
            aria-label={`대기 ${count}건`}
            className="text-label-xs flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(255,122,82,0.8)] text-white"
          >
            {count}
          </span>
        )}
      </Link>
    </DropdownMenu.Item>
  );
}
