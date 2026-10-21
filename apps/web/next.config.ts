import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
