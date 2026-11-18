"use client";

import { ChevronUp, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/shared/api/client";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";

import { useEndedChats, useOngoingChats, type ChatListItem } from "../use-chat-list";

/** "2026-09-30" → "9월 30일" */
const toMonthDay = (date: string) => {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
};

/**
 * 하단 탭 "채팅"의 채팅방 목록. Figma "채팅".
 * - 진행중인 채팅: 참여가 확정된 챌린지(승인 대기는 채팅 불가, 위키 7절). 시작 보류는 숨긴다.
 * - 완료된 채팅: 끝난 챌린지의 채팅 기록(읽기 전용). 접고 펼칠 수 있다.
 * TODO: 마지막 메시지 미리보기·시각·안 읽은 수, 검색·삭제는 백엔드 API·정책이 생기면 붙인다.
 */
export default function ChatList() {
  const ongoing = useOngoingChats();
  const ended = useEndedChats();
  const [endedOpen, setEndedOpen] = useState(true);

  if (ongoing.isPending || ended.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="채팅 목록을 불러오는 중"
        className="flex flex-col gap-2 px-4"
      >
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-[84px] rounded-[20px]" />
        ))}
      </div>
    );
  }

  // 비로그인(401)은 빈 목록과 같은 안내를 보여 준다.
  const error = [ongoing.error, ended.error].find(
    (cause) => cause && !(cause instanceof ApiError && cause.status === 401),
  );
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16">
        <p className="text-body-md font-body-normal text-fg-tertiary">정보를 불러오지 못했어요.</p>
        <Button
          variant="outline"
          size="md"
          onClick={() => Promise.all([ongoing.refetch(), ended.refetch()])}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const ongoingChats = ongoing.data ?? [];
  const endedChats = ended.data ?? [];

  return (
    <main className="flex flex-col gap-4 px-4 pb-6">
      <p className="text-label-sm text-fg-tertiary">
        채팅방은 챌린지 참여가 확정된 뒤 열려요. 승인을 기다리는 동안에는 보이지 않아요.
      </p>

      <section aria-labelledby="ongoing-chats" className="flex flex-col gap-1">
        <GroupLabel id="ongoing-chats" label="진행중인 채팅" count={ongoingChats.length} />
        {ongoingChats.length === 0 ? (
          <p className="text-body-sm font-body-normal text-fg-tertiary px-1 py-6 text-center">
            참여 중인 챌린지 채팅이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {ongoingChats.map((chat) => (
              <ChatRow key={chat.challengeId} chat={chat} />
            ))}
          </ul>
        )}
      </section>

      {endedChats.length > 0 && (
        <>
          <Separator />
          <section aria-labelledby="ended-chats" className="flex flex-col gap-1">
            <GroupLabel
              id="ended-chats"
              label="완료된 채팅"
              count={endedChats.length}
              action={
                <button
                  type="button"
                  aria-expanded={endedOpen}
                  aria-controls="ended-chat-list"
                  aria-label={endedOpen ? "완료된 채팅 접기" : "완료된 채팅 펼치기"}
                  onClick={() => setEndedOpen((open) => !open)}
                  className="text-fg-tertiary flex size-8 items-center justify-center"
                >
                  <ChevronUp
                    aria-hidden
                    className={cn("size-5 transition-transform", !endedOpen && "rotate-180")}
                  />
                </button>
              }
            />
            {endedOpen && (
              <ul id="ended-chat-list" className="flex flex-col gap-2">
                {endedChats.map((chat) => (
                  <ChatRow key={chat.challengeId} chat={chat} ended />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function GroupLabel({
  id,
  label,
  count,
  action,
}: {
  id: string;
  label: string;
  count: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <h2 id={id} className="text-label-lg flex gap-1">
        <span className="font-label-strong text-fg-primary">{label}</span>
        <span className="font-label-normal text-fg-secondary">{count}</span>
      </h2>
      {action}
    </div>
  );
}

/** 채팅방 한 줄. 완료된 채팅은 흐리게 보이고 오른쪽에 종료일을 보여 준다. */
function ChatRow({ chat, ended = false }: { chat: ChatListItem; ended?: boolean }) {
  return (
    <li>
      <Link
        href={`/challenges/${chat.challengeId}/chat`}
        className="bg-surface-primary flex items-center gap-3 rounded-[20px] p-3"
      >
        <div className={cn("flex min-w-0 flex-1 items-center gap-3", ended && "opacity-60")}>
          <div className="rounded-12 bg-surface-secondary relative size-15 shrink-0 overflow-hidden">
            {chat.coverImageUrl ? (
              // TODO: 이미지 저장소 도메인이 정해지면 next.config의 images.remotePatterns에 등록하고 최적화를 켠다.
              <Image
                src={chat.coverImageUrl}
                alt=""
                fill
                sizes="60px"
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-fg-disabled absolute inset-0 flex items-center justify-center">
                <ImageIcon aria-hidden className="size-5" />
              </span>
            )}
            <Badge
              variant="neutral"
              size="sm"
              className="text-label-xs absolute top-0.5 left-1/2 h-auto -translate-x-1/2 bg-black/45 px-1 py-px text-white"
            >
              {chat.category}
            </Badge>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-label-md font-label-normal text-fg-primary min-w-0 flex-1 truncate">
                {chat.title}
              </p>
              {ended && (
                <span className="text-label-sm text-fg-tertiary shrink-0">
                  {toMonthDay(chat.endDate)}
                </span>
              )}
            </div>
            <p className="text-label-xs text-fg-tertiary">{chat.summary}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}
