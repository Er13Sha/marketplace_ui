import { requestJson } from "@/shared/api/request-json";
import type { Order, OrdersResponse } from "../domain/order";

export const orderApi = {
  checkout: () =>
    requestJson<Order>("/api/orders/checkout", {
      method: "POST",
    }),

  listOrders: (init?: RequestInit) =>
    requestJson<OrdersResponse>("/api/orders?limit=20", {
      cache: "no-store",
      ...init,
    }),

  getOrder: (orderId: string, init?: RequestInit) =>
    requestJson<Order>(`/api/orders/${orderId}`, {
      cache: "no-store",
      ...init,
    }),
};
