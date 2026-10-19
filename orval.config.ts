import { defineConfig } from "orval";

export default defineConfig({
  morak: {
    input: {
      target: process.env.OPENAPI_URL ?? "http://localhost:8080/v3/api-docs",
    },
    output: {
      mode: "tags-split",
      target: "src/shared/api/generated/endpoints",
      schemas: "src/shared/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      mock: true,
      clean: true,
      formatter: "prettier",
      override: {
        mutator: {
          path: "src/shared/api/fetcher.ts",
          name: "customFetch",
        },
      },
    },
  },
});
