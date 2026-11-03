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

  if (provider !== "kakao" && provider !== "google") {
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

  if (provider === "kakao") {
    const state = crypto.randomUUID();
    const url = new URL(PROVIDERS[provider].authorizeUrl);
    url.searchParams.set("client_id", PROVIDERS[provider].clientId!);
    url.searchParams.set("redirect_uri", PROVIDERS[provider].redirectUri!);
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
}
