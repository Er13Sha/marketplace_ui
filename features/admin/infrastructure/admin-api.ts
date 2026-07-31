import { requestJson } from "@/shared/api/request-json";
import type { AdminSellersResponse } from "../domain/admin-seller";
import type { AdminSummary } from "../domain/admin-summary";

export const adminApi = {
  getSummary: (init?: RequestInit) =>
    requestJson<AdminSummary>("/api/admin/summary", {
      cache: "no-store",
      ...init,
    }),

  listSellers: (init?: RequestInit) =>
    requestJson<AdminSellersResponse>("/api/admin/sellers", {
      cache: "no-store",
      ...init,
    }),
};
