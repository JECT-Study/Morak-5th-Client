import { Client, ReconnectionTimeMode } from "@stomp/stompjs";

/** 연결에 성공하지 못한 채 연속으로 이만큼 끊기면 재연결을 멈춘다(5·10·20·30·30초, 약 1분 반) */
export const MAX_CONNECT_FAILURES = 5;

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
  /**
   * 연결하지 못하고 연속으로 MAX_CONNECT_FAILURES번 끊겨 재연결을 멈췄을 때(서버 다운·프록시 설정 오류 등).
   * 그대로 두면 끊길 때마다 티켓을 새로 받으며 끝없이 재시도한다. 다시 연결하려면 client.activate()를 부른다.
   */
  onGiveUp?: () => void;
};

export function createChatSocket(options: CreateChatSocketOptions): Client {
  /** 마지막으로 연결에 성공한 뒤 연속으로 끊긴 횟수 */
  let failures = 0;

  const client = new Client({
    brokerURL: options.brokerURL,
    webSocketFactory: options.webSocketFactory,
    // 5초부터 두 배씩 늘려 최대 30초 간격으로 다시 연결한다. 연결되면 5초로 돌아간다.
    reconnectDelay: 5000,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    maxReconnectDelay: 30_000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: async (c) => {
      c.connectHeaders = await options.getConnectHeaders();
    },
    onConnect: () => {
      failures = 0;
      options.onConnect(client);
    },
    onWebSocketClose: () => {
      options.onDisconnect?.();
      // 직접 멈춘(deactivate) 경우는 세지 않는다.
      if (!client.active) return;
      failures += 1;
      if (failures < MAX_CONNECT_FAILURES) return;
      failures = 0; // 다시 activate하면 처음부터 센다
      void client.deactivate();
      options.onGiveUp?.();
    },
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
