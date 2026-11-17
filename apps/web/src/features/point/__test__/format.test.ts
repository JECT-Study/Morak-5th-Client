import { describe, expect, it } from "vitest";

import { formatPointChange, formatTransactionTime, toTransactionLabel } from "../format";
import type { PointTransaction } from "../types";

const transaction = (overrides: Partial<PointTransaction>): PointTransaction => ({
  id: 1,
  type: "GRANT",
  reason: null,
  challengeTitle: null,
  amount: 0,
  balanceAfter: 0,
  createdAt: "2026-11-09T03:00:00Z",
  ...overrides,
});

describe("포인트 표기", () => {
  it("변동 포인트에 부호와 천 단위 쉼표를 붙인다", () => {
    expect(formatPointChange(3000)).toBe("+3,000P");
    expect(formatPointChange(-3000)).toBe("-3,000P");
    expect(formatPointChange(0)).toBe("0P");
  });

  it("거래 시각(UTC)을 KST로 바꿔 보여 준다", () => {
    expect(formatTransactionTime("2026-11-09T03:00:00Z")).toBe("2026.11.09 12:00");
    expect(formatTransactionTime("2026-11-09T15:30:00Z")).toBe("2026.11.10 00:30");
  });

  it("거래 유형을 라벨로 바꾸고 보증금이라는 말은 쓰지 않는다", () => {
    expect(toTransactionLabel(transaction({ type: "GRANT", reason: "SIGNUP_GIFT" }))).toBe(
      "가입 축하 포인트",
    );
    expect(toTransactionLabel(transaction({ type: "GRANT" }))).toBe("포인트 지급");
    expect(toTransactionLabel(transaction({ type: "DEPOSIT" }))).toBe("챌린지 참여");
    expect(toTransactionLabel(transaction({ type: "REFUND" }))).toBe("참여 포인트 반환");
  });
});
