import { Client } from "@stomp/stompjs";

type CreateChatSocketOptions = {
  brokerURL: string;
  getConnectHeaders: () => Promise<Record<string, string>>; // 연결할 때마다 티켓을 새로 받음
  webSocketFactory?: () => WebSocket; // 테스트에서 가짜 소켓 주입
  onConnect: (client: Client) => void; // 연결·재연결될 때마다 호출
  onDisconnect?: () => void;
  onError?: (message: string) => void;
};

export function createChatSocket(options: CreateChatSocketOptions): Client {
  const client = new Client({
    brokerURL: options.brokerURL,
    webSocketFactory: options.webSocketFactory,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: async (c) => {
      c.connectHeaders = await options.getConnectHeaders();
    },
    onConnect: () => options.onConnect(client),
    onWebSocketClose: () => options.onDisconnect?.(),
    onStompError: (frame) => {
      options.onError?.(frame.headers.message ?? "STOMP error");
      void client.deactivate(); // 인증 실패 같은 에러는 재연결해도 소용없으니 멈춘다
    },
  });

  return client;
}
