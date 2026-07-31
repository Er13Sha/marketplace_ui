export type AdminSummaryCounts = {
  users: number;
  sellers: number;
  products: number;
  orders: number;
};

export type AdminSummaryProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  seller_name: string | null;
  created_at: string;
};

export type AdminSummaryOrder = {
  id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  total: number;
  currency: string;
  created_at: string;
};

export type AdminSummary = {
  counts: AdminSummaryCounts;
  latest_products: AdminSummaryProduct[];
  latest_orders: AdminSummaryOrder[];
  generated_at: string;
};
