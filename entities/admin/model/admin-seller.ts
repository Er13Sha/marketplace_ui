export type AdminSeller = {
  id: string;
  owner_user_id: string;
  owner_email: string | null;
  display_name: string;
  legal_type: string;
  status: string;
  created_at: string;
};

export type AdminSellersResponse = {
  items: AdminSeller[];
  count: number;
  limit: number;
  offset: number;
};
