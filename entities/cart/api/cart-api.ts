import { requestJson } from "@/shared/api";
import type { Cart } from "../model/cart";

export const cartApi = {
  getCart: (init?: RequestInit) =>
    requestJson<Cart>("/api/cart", {
      cache: "no-store",
      ...init,
    }),

  addItem: (productId: string, quantity = 1) =>
    requestJson<Cart>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
      }),
    }),

  updateItem: (productId: string, quantity: number) =>
    requestJson<Cart>(`/api/cart/items/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({
        quantity,
      }),
    }),

  removeItem: (productId: string) =>
    requestJson<Cart>(`/api/cart/items/${productId}`, {
      method: "DELETE",
    }),

  clear: () =>
    requestJson<Cart>("/api/cart", {
      method: "DELETE",
    }),
};
