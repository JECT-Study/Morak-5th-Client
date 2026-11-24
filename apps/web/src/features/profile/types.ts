import type { Interest } from "@/features/auth/types";

/** 획득한 메달(백엔드 UserRecordReader.Medal) */
export type Medal = { code: string; name: string; iconUrl: string | null };

/**
 * GET /users/{userId} 응답 data(백엔드 UserProfileView, 위키 6.2·6.5·6.11).
 * 인증 기록이 없으면 certificationRate·morakiStage는 null이고 hasCertificationRecord가 false다.
 */
export type UserProfile = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  profileLinkUrl: string | null;
  /** 관심 분야 코드(이름순) */
  interests: Interest[];
  /** 개인 인증률(정수 %) */
  certificationRate: number | null;
  /** 모락이 단계(1~5). 서버가 정한다(FE 계산 금지) */
  morakiStage: number | null;
  hasCertificationRecord: boolean;
  /** 누적 완주 횟수 */
  completedCount: number;
  /** 중도 실패(퇴장) 챌린지 횟수 */
  midwayFailCount: number;
  medals: Medal[];
};
