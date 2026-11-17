import { useQuery } from "@tanstack/react-query";

import { fetchChallenge } from "./challenge-api";

/** 챌린지 상세. 상세 화면과 (나중에) 그룹 화면이 같은 키로 나눠 쓴다. */
export const useChallenge = (id: string) =>
  useQuery({ queryKey: ["challenges", id], queryFn: () => fetchChallenge(id) });
