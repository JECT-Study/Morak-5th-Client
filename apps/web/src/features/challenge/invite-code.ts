/**
 * 초대 코드로 들어온 챌린지의 코드를 기억한다(챌린지 id → 코드).
 * 비공개 챌린지는 참여 전이면 일반 상세 조회(GET /challenges/{id})가 403이라,
 * 코드로 들어왔으면 상세를 코드로 다시 받고(by-code) 신청할 때도 코드를 함께 보낸다.
 * 새로고침해도 이어지게 이 탭의 sessionStorage에 둔다. 못 쓰면 메모리에만 둔다.
 */
const KEY = "morak:invite-codes";
const memory = new Map<string, string>();

const read = (): Record<string, string> => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

export const rememberInviteCode = (challengeId: string, code: string) => {
  memory.set(challengeId, code);
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...read(), [challengeId]: code }));
  } catch {
    // 저장하지 못하면 메모리에만 둔다(새로고침하면 다시 코드로 들어와야 한다).
  }
};

export const getInviteCode = (challengeId: string): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return memory.get(challengeId) ?? read()[challengeId];
};
