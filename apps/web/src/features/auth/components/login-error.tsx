type Props = Pick<PageProps<"/login">, "searchParams">;

const MESSAGE: Record<string, string> = {
  login_failed: "로그인에 실패했어요. 다시 시도해 주세요.",
  invalid_state: "로그인 요청이 만료됐어요. 다시 시도해 주세요.",
  dev_login_failed:
    "테스트 로그인에 실패했어요. 백엔드가 local 프로필로 떠 있는지, code 형식(영문·숫자·_·-)을 확인해 주세요.",
};

/** 로그인 실패(login_failed) 때 백엔드 오류 코드별 안내(AuthErrorCode) */
const REASON_MESSAGE: Record<string, string> = {
  AUTH_001: "카카오 인증이 만료됐어요. 다시 시도해 주세요.",
  AUTH_002: "카카오 로그인 처리 중 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.",
  AUTH_003: "탈퇴한 계정이라 로그인할 수 없어요.",
};

/**
 * 로그인 실패 안내. 카카오 콜백은 실패하면 error=login_failed와 함께 reason(백엔드 오류 코드)을 넘긴다.
 * 아는 코드면 그에 맞는 문구를, 모르는 코드면 기본 문구 뒤에 코드를 붙여 원인을 찾을 수 있게 한다.
 */
export default async function LoginError({ searchParams }: Props) {
  const { error, reason } = await searchParams;
  if (typeof error !== "string" || !MESSAGE[error]) return null;
  const code = typeof reason === "string" ? reason : null;
  const message = (code && REASON_MESSAGE[code]) ?? MESSAGE[error];

  return (
    <p role="alert" className="text-label-sm text-danger">
      {message}
      {code && <span className="text-fg-tertiary"> (오류 코드 {code})</span>}
    </p>
  );
}
