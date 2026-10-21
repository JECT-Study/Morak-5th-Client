import type { RequestHandler } from "msw";

/**
 * MSW 요청 핸들러 모음.
 * `npm run api:generate` 후 Orval이 만든 `get*Mock()` 핸들러를 여기에 펼쳐 넣는다.
 * 예) import { getChallengeMock } from "@/shared/api/generated/endpoints/challenge/challenge.msw";
 *     export const handlers = [...getChallengeMock()];
 */
export const handlers: RequestHandler[] = [];
