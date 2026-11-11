import { describe, expect, it } from "vitest";

import { mergeMessages } from "../merge-messages";
import type { ChatMessage } from "../type";

const message = (id: number, overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id,
  type: "USER",
  clientMessageId: null,
  sender: { userId: 1, nickname: "모락", profileImageUrl: null, role: "MEMBER" },
  content: `메시지 ${id}`,
  reply: null,
  createdAt: `2026-11-05T06:00:0${id}Z`,
  ...overrides,
});

describe("mergeMessages", () => {
  it("새 메시지를 뒤에 붙인다", () => {
    expect(mergeMessages([message(1), message(2)], [message(3)]).map((m) => m.id)).toEqual([
      1, 2, 3,
    ]);
  });

  it("같은 id는 하나만 남긴다", () => {
    expect(
      mergeMessages([message(1), message(2)], [message(2), message(3)]).map((m) => m.id),
    ).toEqual([1, 2, 3]);
  });

  it("늦게 도착한 메시지도 시간 순서대로 넣는다", () => {
    expect(
      mergeMessages([message(1), message(4)], [message(2), message(3)]).map((m) => m.id),
    ).toEqual([1, 2, 3, 4]);
  });

  it("같은 id면 새로 온 내용으로 바꾼다", () => {
    const merged = mergeMessages([message(1, { content: "A" })], [message(1, { content: "B" })]);
    expect(merged).toHaveLength(1);
    expect(merged[0].content).toBe("B");
  });

  it("createdAt이 같으면 id 순서로 정렬한다", () => {
    const createdAt = "2026-11-05T06:00:00Z";
    const merged = mergeMessages([message(2, { createdAt })], [message(1, { createdAt })]);
    expect(merged.map((m) => m.id)).toEqual([1, 2]);
  });

  it("원본 배열을 바꾸지 않는다", () => {
    const current = [message(2), message(1)];
    mergeMessages(current, [message(3)]);
    expect(current.map((m) => m.id)).toEqual([2, 1]);
  });
});
