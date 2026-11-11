import { Client } from "@stomp/stompjs";

type CreateChatSocketOptions = {
  brokerURL: string;
  getConnectHeaders: () => Promise<Record<string, string>>; // 연결할 때마다 티켓을 새로 받음
  webSocketFactory?: () => WebSocket; // 테스트에서 가짜 소켓 주입
  onConnect: (client: Client) => void; // 연결·재연결될 때마다 호출
  onDisconnect?: () => void;
  /**
   * 서버가 STOMP ERROR 프레임을 보냈을 때. 서버는 ERROR 뒤 연결을 닫고, client는 reconnectDelay 후 다시 연결한다.
   * 다시 연결해도 소용없는 에러(예: 참가자가 아님)면 받는 쪽에서 client.deactivate()로 멈춘다.
   */
  onError?: (error: { code: string | undefined; message: string }, client: Client) => void;
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
      // 백엔드는 에러 코드를 code 헤더로 보낸다 (예: CHAT_008 티켓 만료)
      options.onError?.(
        { code: frame.headers.code, message: frame.headers.message ?? "STOMP error" },
        client,
      );
    },
  });

  return client;
}
