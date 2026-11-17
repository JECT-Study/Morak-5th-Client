import { request } from "@/shared/api/client";

import type { MarketingAgreementRequest } from "./types";

export const logout = () => request<Record<string, never>>("/api/auth/logout", { method: "POST" });

export const withdraw = () => request<Record<string, never>>("/api/users/me", { method: "DELETE" });

export const updateMarketingAgreement = (body: MarketingAgreementRequest) =>
  request<Record<string, never>>("/api/users/me/marketing-agreements", {
    method: "PATCH",
    json: body,
  });
