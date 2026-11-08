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

/** GET /users/me 응답 data (백엔드 MyUserInfo) */
export type MyUserInfo = {
  userId: number;
  email: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  termsAgreed: boolean;
  marketingAgreed: boolean;
  onboarded: boolean;
};

/** POST /users/me/terms-agreements 요청. 필수 4개가 모두 true여야 한다. */
export type TermsAgreementsRequest = {
  age14OrOlder: boolean;
  serviceTermsAgreed: boolean;
  privacyAgreed: boolean;
  photoCollectionAgreed: boolean;
  marketingAgreed: boolean;
};

/** 관심 분야 (백엔드 Interest enum) */
export type Interest = "STUDY" | "EXERCISE" | "CAREER" | "LIFESTYLE" | "READING";

/** POST /users/me/onboarding 요청. 약관 동의 후에만 호출할 수 있다. */
export type OnboardingRequest = {
  /** 한글·영문·숫자 2~12자 */
  nickname: string;
  /** 255자 이하 */
  bio: string | null;
  /** http(s)로 시작하는 URL, 255자 이하 */
  profileLinkUrl: string | null;
  /** 1개 이상 */
  interests: Interest[];
};

/** GET /users/nickname-check 응답 data */
export type NicknameCheckResponse = { available: boolean };
