"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useEffect } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";
import { Spinner } from "@/shared/ui/spinner";

import { chatDateKey } from "../format";
import type { ChatMessage } from "../type";
import { useChatRoom } from "../use-chat-room";
import { ChatInput, ChatReadOnlyNotice, type ReadOnlyReason } from "./chat-input";
import {
  DateDivider,
  IncomingMessage,
  OutgoingMessage,
  PendingOutgoingMessage,
  SystemMessage,
} from "./chat-message";

/** 경로의 [id]를 읽어 채팅방을 연다. 잘못된 번호면 안내만 보여준다. */
export default function ChatRoomScreen({ readOnly }: { readOnly?: ReadOnlyReason }) {
  const { id } = useParams<{ id: string }>();
  const challengeId = Number(id);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return <p className="text-body-sm text-fg-tertiary p-4">잘못된 챌린지 번호예요.</p>;
  }
  return <ChatRoom challengeId={challengeId} readOnly={readOnly} />;
}

/**
 * 페이지를 맨 아래로 내린다. 입력창이 화면 아래에 붙어(sticky) 있어서, 마지막 말풍선을 화면 끝에 맞추면
 * 입력창에 가려진다. 그래서 요소 기준(scrollIntoView)이 아니라 문서 끝까지 내린다.
 */
const scrollToBottom = () => {
  window.scrollTo({ top: document.documentElement.scrollHeight });
};

/** 같은 사람이 같은 날 바로 이어 보낸 메시지면 프로필·이름을 생략한다. */
const isContinued = (message: ChatMessage, prev: ChatMessage | undefined) =>
  !!prev &&
  prev.type === "USER" &&
  message.type === "USER" &&
  prev.sender?.userId === message.sender?.userId &&
  chatDateKey(prev.createdAt) === chatDateKey(message.createdAt);

/**
 * 채팅방(Figma "채팅" — 기본 채팅방). 날짜 구분선 · 받은/보낸 메시지 · 시스템 안내 · 입력창.
 * 메시지 목록은 role="log"라 새 메시지가 오면 스크린리더가 읽어 준다.
 */
function ChatRoom({ challengeId, readOnly }: { challengeId: number; readOnly?: ReadOnlyReason }) {
  const room = useChatRoom(challengeId);
  const { data: me } = useMyInfo();

  // 새 메시지가 아래에 붙을 때만 맨 아래로 내린다(이전 메시지를 불러올 때는 그대로).
  // 보내기에 실패하면 아래에 "재 전송" 버튼이 생겨 높이가 늘어나므로 그때도 내린다.
  const lastId = room.messages.at(-1)?.id;
  const failedCount = room.pending.filter((item) => item.status === "failed").length;
  useEffect(() => {
    scrollToBottom();
  }, [lastId, room.pending.length, failedCount]);

  // 내가 보내면 바로 맨 아래로 내린다. 그려진 다음에 내려야 새 말풍선까지 보인다.
  const send = (text: string) => {
    const sent = room.send(text);
    if (sent) requestAnimationFrame(scrollToBottom);
    return sent;
  };

  const noMessages = room.messages.length === 0 && room.pending.length === 0;
  const empty = noMessages && room.status === "connected";
  // 처음 들어와 연결·첫 메시지를 기다리는 동안은 빈 화면 대신 스피너를 보인다.
  const connecting = noMessages && room.status === "connecting";

  return (
    <div className="bg-background-primary flex flex-1 flex-col">
      <ConnectionNotice status={room.status} error={room.error} />

      {connecting ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={48} label="채팅방에 연결하는 중" />
        </div>
      ) : empty ? (
        <p className="text-body-lg font-body-normal text-fg-primary flex flex-1 items-center justify-center text-center">
          첫 인사를 나누고,
          <br />
          함께할 도전을 응원해 보세요!
        </p>
      ) : (
        <ol role="log" aria-label="채팅 메시지" className="flex flex-1 flex-col gap-6 px-4 py-4">
          {room.hasOlder && room.messages.length > 0 && (
            <li className="flex justify-center">
              <button
                type="button"
                onClick={() => void room.loadOlder()}
                disabled={room.loadingOlder}
                className="text-body-2xs text-fg-tertiary focus-visible:ring-line-focus rounded-4 underline focus-visible:ring-2 focus-visible:outline-none"
              >
                {room.loadingOlder ? <Spinner size={24} /> : "이전 메시지 더 보기"}
              </button>
            </li>
          )}
          {room.messages.map((message, index) => {
            const prev = room.messages[index - 1];
            const newDay = !prev || chatDateKey(prev.createdAt) !== chatDateKey(message.createdAt);
            const isMine = me !== undefined && message.sender?.userId === me.userId;
            return (
              <Fragment key={message.id}>
                {newDay && <DateDivider createdAt={message.createdAt} />}
                {message.type === "SYSTEM" ? (
                  <SystemMessage message={message} />
                ) : isMine ? (
                  <OutgoingMessage message={message} />
                ) : (
                  <IncomingMessage message={message} continued={isContinued(message, prev)} />
                )}
              </Fragment>
            );
          })}
          {room.pending.map((item) => (
            <PendingOutgoingMessage
              key={item.clientMessageId}
              item={item}
              onRetry={() => room.retry(item.clientMessageId)}
            />
          ))}
        </ol>
      )}

      {readOnly ? (
        <ChatReadOnlyNotice reason={readOnly} />
      ) : (
        <ChatInput onSend={send} disabled={room.status !== "connected"} />
      )}
    </div>
  );
}

/** 연결이 끊겼거나 들어갈 수 없을 때만 위에 한 줄 안내를 띄운다(연결되면 숨김). */
function ConnectionNotice({
  status,
  error,
}: {
  status: ReturnType<typeof useChatRoom>["status"];
  error: { code: string; message: string } | null;
}) {
  if (status === "connected") return null;
  if (status === "error") {
    return (
      <p role="alert" className="text-body-2xs text-danger bg-surface-secondary px-4 py-2">
        {error?.message ?? "채팅에 연결할 수 없어요."}
        {error?.code === "UNAUTHENTICATED" && (
          <Link href="/login" className="ml-1 underline">
            로그인
          </Link>
        )}
      </p>
    );
  }
  return (
    <p role="status" className="text-body-2xs text-fg-tertiary bg-surface-secondary px-4 py-2">
      {status === "connecting"
        ? "채팅에 연결하는 중이에요…"
        : "연결이 끊겨 다시 연결하는 중이에요…"}
    </p>
  );
}
