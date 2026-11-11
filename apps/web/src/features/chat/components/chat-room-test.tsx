"use client";

import { BlockButton } from "@jects/jds";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";

import type { ChatMessage, PendingMessage } from "../type";
import { useChatRoom, type ChatStatus } from "../use-chat-room";

/*
 * 채팅 연결 테스트용 임시 화면. 디자인 시안이 나오면 교체한다.
 * 연결 상태, 메시지 id·clientMessageId처럼 확인에 필요한 정보를 그대로 보여준다.
 */

const STATUS_LABEL: Record<ChatStatus, string> = {
  connecting: "연결 중…",
  connected: "연결됨",
  disconnected: "연결 끊김 · 다시 연결하는 중",
  error: "연결 중단",
};

const formatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });

export default function ChatRoomTest() {
  const { id } = useParams<{ id: string }>();
  const challengeId = Number(id);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return <p className="text-label-md text-object-alternative p-6">잘못된 챌린지 번호예요.</p>;
  }
  return <ChatRoom challengeId={challengeId} />;
}

function ChatRoom({ challengeId }: { challengeId: number }) {
  const room = useChatRoom(challengeId);
  const { data: me } = useMyInfo();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 아래에 붙을 때만 맨 아래로 스크롤한다 (이전 메시지를 불러올 때는 그대로)
  const lastId = room.messages.at(-1)?.id;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, room.pending.length]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (room.send(text)) setText("");
  };

  return (
    <div className="flex flex-1 flex-col">
      <StatusBar status={room.status} error={room.error} />

      <ol className="flex flex-1 flex-col gap-3 px-6 py-4">
        {room.hasOlder && room.messages.length > 0 && (
          <li className="flex justify-center">
            <button
              type="button"
              onClick={() => void room.loadOlder()}
              disabled={room.loadingOlder}
              className="text-label-sm text-object-alternative underline"
            >
              {room.loadingOlder ? "불러오는 중…" : "이전 메시지 더 보기"}
            </button>
          </li>
        )}
        {room.messages.length === 0 && room.status === "connected" && (
          <li className="text-label-sm text-object-assistive py-10 text-center">
            아직 메시지가 없어요.
          </li>
        )}
        {room.messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isMine={me !== undefined && message.sender?.userId === me.userId}
          />
        ))}
        {room.pending.map((item) => (
          <PendingItem
            key={item.clientMessageId}
            item={item}
            onRetry={() => room.retry(item.clientMessageId)}
            onDiscard={() => room.discard(item.clientMessageId)}
          />
        ))}
        <div ref={endRef} />
      </ol>

      <form
        onSubmit={handleSubmit}
        className="bg-page border-stroke-subtler sticky bottom-0 flex gap-2 border-t px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={1000}
          placeholder={room.status === "connected" ? "메시지 입력" : "연결되면 보낼 수 있어요"}
          aria-label="메시지 입력"
          className="rounded-8 border-stroke-subtle bg-surface-standard text-label-md flex-1 border px-3"
        />
        <BlockButton type="submit" size="md" disabled={room.status !== "connected" || !text.trim()}>
          보내기
        </BlockButton>
      </form>
    </div>
  );
}

function StatusBar({
  status,
  error,
}: {
  status: ChatStatus;
  error: { code: string; message: string } | null;
}) {
  const color =
    status === "connected"
      ? "text-feedback-positive"
      : status === "error"
        ? "text-feedback-destructive"
        : "text-object-alternative";
  return (
    <div className="bg-surface-standard border-stroke-subtler flex items-center justify-between border-b px-6 py-2">
      <span className={`text-label-sm font-label-bold ${color}`}>● {STATUS_LABEL[status]}</span>
      {error && (
        <span className="text-label-xs text-feedback-destructive">
          {error.code} · {error.message}
          {error.code === "UNAUTHENTICATED" && (
            <Link href="/login" className="ml-1 underline">
              로그인
            </Link>
          )}
        </span>
      )}
    </div>
  );
}

function MessageItem({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  if (message.type === "SYSTEM") {
    return (
      <li className="text-label-xs text-object-alternative text-center">
        {message.content} · {formatTime(message.createdAt)}
      </li>
    );
  }
  return (
    <li className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
      {!isMine && (
        <span className="text-label-xs font-label-bold text-object-neutral">
          {message.sender?.nickname ?? "알 수 없음"}
          {message.sender?.role === "HOST" && " · 방장"}
        </span>
      )}
      {message.reply && (
        <span className="text-label-xs text-object-assistive">
          ↩ {message.reply.authorNickname ?? "삭제된 인증"} · {message.reply.certDate ?? "-"} 인증에
          답글
        </span>
      )}
      <div className="flex items-end gap-1.5">
        {isMine && <Time createdAt={message.createdAt} />}
        <p
          className={`rounded-12 text-label-md max-w-60 px-3 py-2 break-all whitespace-pre-wrap ${
            isMine
              ? "bg-accent-subtlest text-object-boldest"
              : "bg-surface-standard text-object-boldest"
          }`}
        >
          {message.content ?? <span className="text-object-assistive">삭제된 메시지예요.</span>}
        </p>
        {!isMine && <Time createdAt={message.createdAt} />}
      </div>
      <span className="text-object-subtle font-mono text-[10px]">
        #{message.id} · {message.clientMessageId?.slice(0, 8) ?? "-"}
      </span>
    </li>
  );
}

function PendingItem({
  item,
  onRetry,
  onDiscard,
}: {
  item: PendingMessage;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const failed = item.status === "failed";
  return (
    <li className="flex flex-col items-end gap-1">
      <p
        className={`rounded-12 text-label-md bg-accent-subtlest text-object-boldest max-w-60 px-3 py-2 break-all whitespace-pre-wrap ${
          failed ? "" : "opacity-50"
        }`}
      >
        {item.content}
      </p>
      {failed ? (
        <span className="text-label-xs text-feedback-destructive flex gap-2">
          {item.errorMessage ?? "보내지 못했어요."}
          <button type="button" onClick={onRetry} className="underline">
            다시 보내기
          </button>
          <button type="button" onClick={onDiscard} className="underline">
            삭제
          </button>
        </span>
      ) : (
        <span className="text-label-xs text-object-assistive">보내는 중…</span>
      )}
      <span className="text-object-subtle font-mono text-[10px]">
        {item.clientMessageId.slice(0, 8)}
      </span>
    </li>
  );
}

function Time({ createdAt }: { createdAt: string }) {
  return (
    <time dateTime={createdAt} className="text-label-xs text-object-assistive shrink-0">
      {formatTime(createdAt)}
    </time>
  );
}
