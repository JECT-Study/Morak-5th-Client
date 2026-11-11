import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 실기기(Expo WebView)에서 PC IP로 접속할 때 개발 서버가 JS·HMR 요청을 막지 않게 허용한다. 예) 192.168.0.10
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  // 워크스페이스 패키지는 TS 소스 그대로 배포되므로 Next가 함께 컴파일한다.
  transpilePackages: ["@morak/bridge"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
