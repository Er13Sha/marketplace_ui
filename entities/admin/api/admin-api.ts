import { requestJson } from "@/shared/api";
import type { AdminSellersResponse } from "../model/admin-seller";
import type { AdminSummary } from "../model/admin-summary";

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
