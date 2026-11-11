import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");

  if (!token) {
    return NextResponse.redirect(new URL(`/login`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/challenges/new/:path*"],
};
