/**
 * 액세스 토큰 재발급(브라우저 전용).
 * BFF /api/auth/refresh가 refresh_token 쿠키로 재발급하고 새 쿠키를 심어 준다.
 * 백엔드가 리프레시 토큰을 한 번 쓰면 폐기(rotation)하므로,
 * 같은 탭에서 동시에 여러 요청이 401을 받아도 재발급은 한 번만 보낸다.
 */
export const REFRESH_URL = "/api/auth/refresh";

/** 진행 중인 재발급. 없으면 null */
let refreshing: Promise<boolean> | null = null;

/** 재발급을 시도하고 성공 여부를 돌려준다. 동시에 불리면 같은 결과를 기다린다. */
export function refreshOnce(): Promise<boolean> {
  refreshing ??= requestRefresh().finally(() => {
    // 끝나면 비워서, 다음에 또 만료됐을 때 다시 재발급할 수 있게 한다.
    refreshing = null;
  });
  return refreshing;
}

async function requestRefresh(): Promise<boolean> {
  try {
    const response = await fetch(REFRESH_URL, {
      method: "POST",
      credentials: "same-origin",
    });
    // TODO: 실패 코드(AUTH_007 / AUTH_003)를 구분할 필요가 있으면 본문을 읽어서 돌려준다.
    return response.ok;
  } catch {
    // 네트워크 오류도 실패로 본다.
    return false;
  }
}
