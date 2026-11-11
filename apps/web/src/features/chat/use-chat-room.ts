import type { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatApiError, fetchChatMessages, fetchChatTicket } from "./chat-api";
import { createChatSocket } from "./chat-socket";
import { mergeMessages } from "./merge-messages";
import type { ChatMessage, ChatSendError, PendingMessage, SendChatMessage } from "./type";

export type ChatStatus = "connecting" | "connected" | "disconnected" | "error";

/** 보낸 메시지가 이 시간 안에 구독으로 돌아오지 않으면 실패로 본다 */
const SEND_TIMEOUT = 10_000;
const PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;
const MAX_CONTENT_LENGTH = 1000;
/** 연결 에러 중 새 티켓으로 다시 연결하면 되는 것 (티켓 만료·인증 안 됨). 나머지는 재연결을 멈춘다 */
const RETRYABLE_CONNECT_ERRORS = new Set(["CHAT_008", "CHAT_009"]);

/**
 * 챌린지 채팅방 하나의 실시간 연결과 메시지 상태.
 *
 * 연결될 때마다(재연결 포함): 새 메시지·내 전송 실패를 구독하고, 놓친 메시지를 REST로 채운다.
 * - 첫 연결: 최신 메시지 30개
 * - 재연결: 마지막으로 받은 id 이후(after)
 *
 * 보내기: clientMessageId(UUID)를 붙여 보내고 pending에 "보내는 중"으로 둔다.
 * 같은 clientMessageId가 구독으로 돌아오면 성공, 전송 실패 알림·10초 무응답·연결 끊김이면 실패.
 * 다시 보낼 때는 같은 clientMessageId를 써서 서버에 중복 저장되지 않게 한다.
 */
export function useChatRoom(challengeId: number) {
  const [status, setStatus] = useState<ChatStatus>("connecting");
  /** 다시 연결해도 소용없는 에러(예: 참가자가 아님). 있으면 화면에서 접근 불가 안내 */
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<Map<string, PendingMessage>>(() => new Map());
  const [hasOlder, setHasOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const clientRef = useRef<Client | null>(null);
  /** 재연결 시 놓친 메시지를 불러올 기준 (가장 최근에 받은 id) */
  const lastIdRef = useRef<number | null>(null);
  /** clientMessageId → 10초 응답 대기 타이머 */
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const clearTimer = useCallback((clientMessageId: string) => {
    clearTimeout(timersRef.current.get(clientMessageId));
    timersRef.current.delete(clientMessageId);
  }, []);

  /** 받은 메시지를 합치고, 그중 내가 보낸 것(pending에 있는 clientMessageId)은 성공 처리한다 */
  const addMessages = useCallback(
    (incoming: ChatMessage[]) => {
      if (incoming.length === 0) return;
      setMessages((prev) => mergeMessages(prev, incoming));
      lastIdRef.current = Math.max(lastIdRef.current ?? 0, ...incoming.map((m) => m.id));

      const sentIds = incoming.flatMap((m) => (m.clientMessageId ? [m.clientMessageId] : []));
      if (sentIds.length === 0) return;
      sentIds.forEach(clearTimer);
      setPending((prev) => {
        if (!sentIds.some((id) => prev.has(id))) return prev; // 다른 사람 메시지면 그대로
        const next = new Map(prev);
        sentIds.forEach((id) => next.delete(id));
        return next;
      });
    },
    [clearTimer],
  );

  const markFailed = useCallback(
    (clientMessageId: string, errorMessage: string) => {
      clearTimer(clientMessageId);
      setPending((prev) => {
        const item = prev.get(clientMessageId);
        if (!item || item.status === "failed") return prev; // 이미 성공했거나 실패 처리됨
        return new Map(prev).set(clientMessageId, { ...item, status: "failed", errorMessage });
      });
    },
    [clearTimer],
  );

  /** 연결이 끊기면 보내는 중이던 메시지는 결과를 알 수 없으므로 모두 실패로 바꾼다 */
  const failAllSending = useCallback((errorMessage: string) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    setPending((prev) => {
      if (![...prev.values()].some((item) => item.status === "sending")) return prev;
      const next = new Map(prev);
      next.forEach((item, id) => {
        if (item.status === "sending") next.set(id, { ...item, status: "failed", errorMessage });
      });
      return next;
    });
  }, []);

  useEffect(() => {
    const timers = timersRef.current;

    /** 첫 연결이면 최신 메시지, 재연결이면 마지막 id 이후를 끝까지 불러온다 */
    const catchUp = async () => {
      const after = lastIdRef.current;
      if (after === null) {
        const latest = await fetchChatMessages(challengeId, { limit: PAGE_SIZE });
        addMessages(latest);
        setHasOlder(latest.length >= PAGE_SIZE);
        return;
      }
      let cursor = after;
      for (;;) {
        const missed = await fetchChatMessages(challengeId, {
          after: cursor,
          limit: MAX_PAGE_SIZE,
        });
        addMessages(missed);
        if (missed.length < MAX_PAGE_SIZE) return;
        cursor = missed[missed.length - 1].id;
      }
    };

    const client = createChatSocket({
      brokerURL: process.env.NEXT_PUBLIC_WS_URL ?? "",
      // 티켓은 30초·1회용이라 연결할 때마다 새로 받는다
      getConnectHeaders: async (): Promise<Record<string, string>> => {
        try {
          const { ticket } = await fetchChatTicket();
          return { ticket };
        } catch (cause) {
          // 로그인이 풀렸거나(401) 온보딩 전이면(403) 다시 연결해도 실패하므로 멈춘다
          if (cause instanceof ChatApiError && (cause.status === 401 || cause.status === 403)) {
            setError({ code: cause.code, message: cause.message });
            setStatus("error");
            void clientRef.current?.deactivate();
          }
          return {};
        }
      },
      onConnect: (c) => {
        setStatus("connected");
        setError(null);
        // 구독을 먼저 걸어야 놓친 메시지를 불러오는 동안 온 메시지도 받는다
        c.subscribe(`/topic/challenges/${challengeId}/chat`, (frame) => {
          addMessages([JSON.parse(frame.body) as ChatMessage]);
        });
        c.subscribe("/user/queue/errors", (frame) => {
          const sendError = JSON.parse(frame.body) as ChatSendError;
          if (sendError.clientMessageId) markFailed(sendError.clientMessageId, sendError.message);
        });
        // 실패해도 다음 재연결 때 after로 다시 채운다
        catchUp().catch(() => undefined);
      },
      onDisconnect: () => {
        setStatus((prev) => (prev === "error" ? prev : "disconnected"));
        failAllSending("연결이 끊겨 보내지 못했어요.");
      },
      onError: ({ code, message }, c) => {
        if (code && RETRYABLE_CONNECT_ERRORS.has(code)) return; // 재연결하면서 새 티켓을 받는다
        setError({ code: code ?? "UNKNOWN", message });
        setStatus("error");
        void c.deactivate();
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
      clientRef.current = null;
      void client.deactivate();
    };
  }, [challengeId, addMessages, markFailed, failAllSending]);

  /** 실제 전송. 보내기와 다시 보내기가 같이 쓴다 */
  const publish = (message: SendChatMessage) => {
    const { clientMessageId } = message;
    setPending((prev) => new Map(prev).set(clientMessageId, { ...message, status: "sending" }));

    const client = clientRef.current;
    if (!client?.connected) {
      markFailed(clientMessageId, "연결되지 않아 보내지 못했어요.");
      return;
    }
    client.publish({
      destination: `/app/challenges/${challengeId}/chat`,
      body: JSON.stringify(message),
    });
    timersRef.current.set(
      clientMessageId,
      setTimeout(() => markFailed(clientMessageId, "응답이 없어 보내지 못했어요."), SEND_TIMEOUT),
    );
  };

  /** 새 메시지 보내기. 보낼 내용이 없거나 너무 길면 false */
  const send = (content: string, replyCertificationId: number | null = null) => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CONTENT_LENGTH) return false;
    publish({ clientMessageId: crypto.randomUUID(), content: trimmed, replyCertificationId });
    return true;
  };

  /** 실패한 메시지를 같은 clientMessageId로 다시 보낸다. 보내는 중이면 무시(중복 전송 방지) */
  const retry = (clientMessageId: string) => {
    const item = pending.get(clientMessageId);
    if (!item || item.status !== "failed") return;
    publish({
      clientMessageId,
      content: item.content,
      replyCertificationId: item.replyCertificationId,
    });
  };

  /** 실패한 메시지를 목록에서 지운다 */
  const discard = (clientMessageId: string) => {
    clearTimer(clientMessageId);
    setPending((prev) => {
      if (!prev.has(clientMessageId)) return prev;
      const next = new Map(prev);
      next.delete(clientMessageId);
      return next;
    });
  };

  /** 위로 스크롤했을 때 더 오래된 메시지를 불러온다 */
  const loadOlder = async () => {
    const oldest = messages[0]?.id;
    if (oldest === undefined || !hasOlder || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const older = await fetchChatMessages(challengeId, { before: oldest, limit: PAGE_SIZE });
      addMessages(older);
      setHasOlder(older.length >= PAGE_SIZE);
    } finally {
      setLoadingOlder(false);
    }
  };

  return {
    status,
    error,
    messages,
    /** 내가 보내는 중·실패한 메시지 (보낸 순서). 화면에서는 messages 아래에 그린다 */
    pending: [...pending.values()],
    send,
    retry,
    discard,
    loadOlder,
    hasOlder,
    loadingOlder,
  };
}
