import { requestJson } from "@/shared/api";
import type {
  ReservationResponse,
  StockResponse,
} from "../model/inventory";

export const inventoryApi = {
  getStock: (productId: string, init?: RequestInit) =>
    requestJson<StockResponse>(`/api/inventory/stock/${productId}`, init),

  reserveStock: (productId: string) =>
    requestJson<ReservationResponse>("/api/inventory/reserve", {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity: 1,
        ttlSeconds: 900,
      }),
    }),

  commitReservation: (reservationId: string) =>
    requestJson("/api/inventory/commit", {
      method: "POST",
      body: JSON.stringify({ reservationId }),
    }),

  releaseReservation: (reservationId: string) =>
    requestJson("/api/inventory/release", {
      method: "POST",
      body: JSON.stringify({ reservationId }),
    }),
};
