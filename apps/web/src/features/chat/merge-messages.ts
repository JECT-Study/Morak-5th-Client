import { ChatMessage } from "./type";

export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  // id 기준으로 합치고(중복 제거) id 오름차순 정렬
  const byId = new Map<number, ChatMessage>();
  for (const message of current) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);

  return [...byId.values()].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id,
  );
}
