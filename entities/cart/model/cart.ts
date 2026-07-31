export type CartItemCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  product_id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: CartItemCategory | null;
  quantity: number;
  line_total: number;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  id: string | null;
  user_id: string;
  status: "active" | "checked_out";
  items: CartItem[];
  items_count: number;
  total: number;
  currency: string;
  created_at: string | null;
  updated_at: string | null;
};
