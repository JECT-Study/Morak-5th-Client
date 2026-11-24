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

describe("createChatSocket 재연결 제한", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const create = () => {
    const onGiveUp = vi.fn();
    const client = createChatSocket({
      brokerURL: "ws://test",
      webSocketFactory: () => new FakeWebSocket() as unknown as WebSocket,
      getConnectHeaders: async () => ({ ticket: "abc" }),
      onConnect: vi.fn(),
      onGiveUp,
    });
    return { client, onGiveUp };
  };

  /** 가장 최근 소켓을 핸드셰이크 실패처럼 끊고, 다음 재연결 시도까지 시간을 보낸다 */
  const failLatest = async (wait: number) => {
    FakeWebSocket.instances.at(-1)!.drop();
    await vi.advanceTimersByTimeAsync(wait);
  };

  it("재연결 간격을 5초부터 두 배씩 늘린다", async () => {
    const { client } = create();
    client.activate();
    await vi.advanceTimersByTimeAsync(0);

    await failLatest(5000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    await failLatest(9999);
    expect(FakeWebSocket.instances).toHaveLength(2); // 두 번째는 10초를 기다린다
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeWebSocket.instances).toHaveLength(3);

    await client.deactivate({ force: true });
  });

  it("연결하지 못하고 5번 연속 끊기면 재연결을 멈추고 onGiveUp을 부른다", async () => {
    const { client, onGiveUp } = create();
    client.activate();
    await vi.advanceTimersByTimeAsync(0);

    for (const wait of [5000, 10000, 20000, 30000]) await failLatest(wait);
    expect(onGiveUp).not.toHaveBeenCalled();
    await failLatest(60_000);

    expect(onGiveUp).toHaveBeenCalledOnce();
    expect(client.active).toBe(false);
    expect(FakeWebSocket.instances).toHaveLength(5); // 더 이상 새 소켓(티켓)을 만들지 않는다
  });

  it("중간에 한 번 연결되면 실패 횟수를 다시 센다", async () => {
    const { client, onGiveUp } = create();
    client.activate();
    await vi.advanceTimersByTimeAsync(0);

    for (const wait of [5000, 10000, 20000, 30000]) await failLatest(wait);
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    socket.receive(CONNECTED);
    await failLatest(5000);

    expect(onGiveUp).not.toHaveBeenCalled();
    await client.deactivate({ force: true });
  });
});

describe("createChatSocket 에러 처리", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ERROR 프레임의 code·message 헤더를 onError로 넘긴다", async () => {
    const onError = vi.fn();
    const client = createChatSocket({
      brokerURL: "ws://test",
      webSocketFactory: () => new FakeWebSocket() as unknown as WebSocket,
      getConnectHeaders: async () => ({ ticket: "abc" }),
      onConnect: vi.fn(),
      onError,
    });
    client.activate();
    await vi.advanceTimersByTimeAsync(0);
    const socket = FakeWebSocket.instances[0];
    socket.open();

    socket.receive("ERROR\ncode:CHAT_008\nmessage:만료된 티켓\n\n\0");

    expect(onError).toHaveBeenCalledWith({ code: "CHAT_008", message: "만료된 티켓" }, client);
    await client.deactivate({ force: true });
  });
});
