import { useEffect, useRef, useState } from "react";
import { createChatSocket } from "./chat-socket";
import { ChatMessage } from "./type";
import { mergeMessages } from "./merge-messages";
import { Client } from "@stomp/stompjs";

type ChatStatus = "connecting" | "connected" | "disconnected" | "error";

// TODO: GET /challenges/{id}/chat/messages?after= API가 나오면 구현
async function fetchMessagesAfter(
  challengeId: number,
  afterId: number | null,
): Promise<ChatMessage[]> {
  return [];
}

export function useChatRoom(challengeId: number) {
  const [status, setStatus] = useState<ChatStatus>("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const lastIdRef = useRef<number | null>(null);
  const clientRef = useRef<Client | null>(null);
  const connectedOnceRef = useRef(false);

  // 받은 메시지를 합치고 기준점(마지막 id)을 앞으로만 옮긴다
  const addMessages = (incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => mergeMessages(prev, incoming));
    const maxId = Math.max(...incoming.map((m) => m.id));
    lastIdRef.current = Math.max(lastIdRef.current ?? 0, maxId);
  };

  useEffect(() => {
    const client = createChatSocket({
      brokerURL: process.env.NEXT_PUBLIC_WS_URL!,
      getConnectHeaders: async () => ({}), // TODO: 인증 방식 확정 후 티켓
      onConnect: (c) => {
        setStatus("connected");
        // 1) 먼저 구독해야 빈틈을 메우는 동안 온 메시지도 놓치지 않는다
        c.subscribe(`/topic/challenges/${challengeId}/chat`, (frame) => {
          addMessages([JSON.parse(frame.body) as ChatMessage]);
        });
        // 2) 재연결이면 끊긴 동안의 메시지를 채운다
        if (connectedOnceRef.current) {
          void fetchMessagesAfter(challengeId, lastIdRef.current).then(addMessages);
        }
        connectedOnceRef.current = true;
      },
      onDisconnect: () => setStatus("disconnected"),
      onError: () => setStatus("error"),
    });

    clientRef.current = client;
    client.activate();

    return () => {
      void client.deactivate();
      clientRef.current = null;
      connectedOnceRef.current = false;
    };
  }, [challengeId]);

  const send = (content: string) => {
    const client = clientRef.current;
    if (!client?.connected) return false;
    client.publish({
      destination: `/app/challenges/${challengeId}/chat.send`,
      body: JSON.stringify({ content }),
    });
    return true;
  };

  return { messages, status, send };
}
