// features/chat/__tests__/chat-socket.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createChatSocket } from "../chat-socket";
import { FakeWebSocket } from "./fake-websocket";

const CONNECTED = "CONNECTED\nversion:1.2\nheart-beat:10000,10000\n\n\0";

describe("createChatSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // 연결 준비: activate → (비동기 beforeConnect) → 소켓 생성 → open
  const setup = async () => {
    const onConnect = vi.fn();
    const client = createChatSocket({
      brokerURL: "ws://test",
      webSocketFactory: () => new FakeWebSocket() as unknown as WebSocket,
      getConnectHeaders: async () => ({ ticket: "abc" }),
      onConnect,
    });
    client.activate();
    await vi.advanceTimersByTimeAsync(0); // beforeConnect(Promise)가 끝나고 소켓이 만들어질 때까지
    const socket = FakeWebSocket.instances[0];
    socket.open();
    return { client, socket, onConnect };
  };

  it("연결하면 티켓을 CONNECT 헤더에 담아 보낸다", async () => {
    const { client, socket } = await setup();

    const connectFrame = socket.sent.find((frame) => frame.startsWith("CONNECT"));
    expect(connectFrame).toContain("ticket:abc");

    await client.deactivate({ force: true });
  });

  it("서버가 CONNECTED를 보내면 onConnect를 client와 함께 호출한다", async () => {
    const { client, socket, onConnect } = await setup();

    socket.receive(CONNECTED);

    expect(onConnect).toHaveBeenCalledWith(client);
    await client.deactivate({ force: true });
  });

  it("연결이 끊기면 5초 뒤 새 소켓으로 다시 연결한다", async () => {
    const { client, socket } = await setup();
    socket.receive(CONNECTED);

    socket.drop();
    await vi.advanceTimersByTimeAsync(5000);

    expect(FakeWebSocket.instances).toHaveLength(2);
    await client.deactivate({ force: true });
  });
});
