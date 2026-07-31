export type StockResponse = {
  product_id: string;
  quantity: number;
  updated_at: string;
};

export type ReservationResponse = {
  reservation_id: string;
  expires_at: string;
};
