/** 백엔드가 지원하는 소셜 로그인 제공자. 현재 kakao만 지원한다. */
export type SocialProvider = "kakao";

/** POST /auth/login/{provider} 요청 (Swagger SocialLoginRequest) */
export type SocialLoginRequest = {
  /** 소셜 로그인 callback에서 받은 일회용 인가 코드 */
  code: string;
};

/** POST /auth/login/{provider} 응답 data (Swagger LoginResponse) */
export type LoginResponse = {
  /** 서비스 Access Token */
  accessToken: string;
  /** 서비스 Refresh Token */
  refreshToken: string;
  /** 인증 토큰 유형. 예) "Bearer" */
  tokenType: string;
  /** Access Token 만료까지 남은 시간(초) */
  accessTokenExpiresIn: number;
  /** Access Token 만료 시각(UTC ISO 8601) */
  accessTokenExpiresAt: string;
  /** 온보딩 완료 여부. false이면 온보딩 화면으로 이동한다. */
  onboarded: boolean;
};
