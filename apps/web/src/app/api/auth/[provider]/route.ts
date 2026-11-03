import { NextResponse } from "next/server";

const PROVIDERS = {
  kakao: {
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    clientId: process.env.KAKAO_REST_API_KEY,
    redirectUri: process.env.KAKAO_REDIRECT_URI,
  },
} as const;

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;

  // PROVIDERS에 설정이 있는 제공자만 허용한다. (구글은 백엔드 지원 후 추가)
  if (!(provider in PROVIDERS)) {
    return NextResponse.json(
      {
        error: {
          code: "UNSUPPORTED_SOCIAL_LOGIN",
          message: "지원하지 않는 소셜 로그인입니다.",
        },
      },
      { status: 400 },
    );
  }

  const config = PROVIDERS[provider as keyof typeof PROVIDERS];
  const state = crypto.randomUUID();
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", config.clientId!);
  url.searchParams.set("redirect_uri", config.redirectUri!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
