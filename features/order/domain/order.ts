export type OrderItem = {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  line_total: number;
  reservation_id: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  cart_id: string | null;
  status: "created" | "cancelled" | "completed";
  items: OrderItem[];
  items_count: number;
  total: number;
  currency: string;
  reservation_ids: string[];
  created_at: string;
  updated_at: string;
};

export type OrdersResponse = {
  items: Order[];
  count: number;
  limit: number;
  offset: number;
};
