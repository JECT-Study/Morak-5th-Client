/**
 * 개발 모드에서만 보이는 테스트 로그인(백엔드 local 프로필의 dev 로그인).
 * - "새 계정으로": 매번 온보딩 전 새 계정을 만든다.
 * - code 입력: 같은 code면 같은 계정으로 다시 들어간다.
 * API 라우트로 이동해 쿠키를 받아야 해서 Link 대신 form(GET)으로 이동한다.
 */
export default function DevLogin() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <section
      aria-label="개발용 테스트 로그인"
      className="border-line rounded-12 flex w-full flex-col gap-2 border border-dashed p-3 text-left"
    >
      <p className="text-label-sm font-label-strong text-fg-tertiary">개발용 테스트 로그인</p>
      <form action="/api/auth/dev-login">
        <button
          type="submit"
          className="bg-surface-secondary rounded-8 text-label-md font-label-strong text-fg-primary h-10 w-full"
        >
          새 계정으로 시작하기
        </button>
      </form>
      <form action="/api/auth/dev-login" className="flex gap-2">
        <input
          name="code"
          required
          pattern="[A-Za-z0-9_\-]{1,64}"
          placeholder="code (예: tester1)"
          aria-label="테스트 계정 code"
          className="border-line rounded-8 text-body-lg font-body-normal text-fg-primary placeholder:text-fg-quaternary h-10 min-w-0 flex-1 border px-3"
        />
        <button
          type="submit"
          className="bg-surface-secondary rounded-8 text-label-md font-label-strong text-fg-primary h-10 shrink-0 px-4"
        >
          로그인
        </button>
      </form>
    </section>
  );
}
