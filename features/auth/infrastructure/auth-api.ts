import { requestJson } from "@/shared/api/request-json";
import type { AuthResponse, SellerProfilePayload } from "../domain/user";

export type RegisterAccountType = "customer" | "seller";

export const authApi = {
  googleStartUrl: (returnTo = "/account") =>
    `/api/backend/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`,

  getCurrentUser: (init?: RequestInit) =>
    requestJson<AuthResponse>("/api/auth/me", {
      cache: "no-store",
      ...init,
    }),

  login: (email: string, password: string) =>
    requestJson<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  register: (
    email: string,
    password: string,
    accountType: RegisterAccountType = "customer",
    sellerProfile?: SellerProfilePayload
  ) =>
    requestJson<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        accountType,
        sellerProfile,
      }),
    }),

  becomeSeller: (sellerProfile: SellerProfilePayload) =>
    requestJson<AuthResponse>("/api/auth/me/seller", {
      method: "POST",
      body: JSON.stringify(sellerProfile),
    }),

  logout: () =>
    requestJson<{ status: string }>("/api/auth/logout", {
      method: "POST",
    }),
};
