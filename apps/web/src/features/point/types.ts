/**
 * 거래 유형. GRANT 지급, DEPOSIT 챌린지 참여로 차감, REFUND 챌린지 참여 포인트 반환.
 * 백엔드가 새 값을 더할 수 있어 string도 받는다.
 */
export type PointTransactionType = "GRANT" | "DEPOSIT" | "REFUND" | (string & {});

/** GET /points/me 거래 한 건 (Swagger TransactionResponse) */
export type PointTransaction = {
  id: number;
  type: PointTransactionType;
  /** 지급 사유. GRANT일 때만 있다. 예) "SIGNUP_GIFT" */
  reason: string | null;
  /** 거래 당시 챌린지 이름. 챌린지 참여·반환 거래일 때만 있다 */
  challengeTitle: string | null;
  /** 변동 포인트. 지급·반환은 +, 차감은 - */
  amount: number;
  balanceAfter: number;
  /** UTC ISO 8601. 화면에는 KST로 바꿔 보여 준다 */
  createdAt: string;
};

/** GET /points/me 응답 data (Swagger PointLedgerResponse) */
export type PointLedger = {
  /** 현재 잔액(P). 화면에는 이 값을 그대로 쓴다(위키 3.4) */
  balance: number;
  transactions: PointTransaction[];
  /** 다음 페이지 요청 때 before로 넘길 값. 마지막 페이지면 null */
  nextCursor: number | null;
};
