/** 백엔드 공통 에러. 예) { code: "AUTH_001", message: "카카오 로그인 인증 코드가 유효하지 않습니다." } */
export type ApiErrorBody = {
  code: string;
  message: string;
};

/**
 * 백엔드 공통 응답 형식. 성공하면 data, 실패하면 error가 채워진다.
 * Swagger의 ApiResponse* 스키마. Orval 생성 코드를 쓰기 전까지 BFF에서 직접 쓴다.
 */
export type ApiResponse<T> =
  { success: true; data: T; error: null } | { success: false; data: null; error: ApiErrorBody };
