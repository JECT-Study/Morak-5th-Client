// features/chat/__tests__/fake-websocket.ts
export class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  readyState = 0; // CONNECTING
  protocol = "";
  binaryType = "arraybuffer";
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.readyState = 3;
    this.onclose?.({ code: 1000, reason: "", wasClean: true });
  }

  // 아래는 테스트에서 "서버" 역할로 부르는 함수
  open() {
    this.readyState = 1;
    this.onopen?.();
  }
  receive(frame: string) {
    this.onmessage?.({ data: frame });
  }
  drop() {
    this.readyState = 3;
    this.onclose?.({ code: 1006, reason: "", wasClean: false });
  }
}
