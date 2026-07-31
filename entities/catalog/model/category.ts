export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoriesResponse = {
  items: Category[];
  count: number;
  total?: number;
  limit: number;
  offset: number;
};

export type CreateCategoryPayload = {
  name: string;
  slug: string;
  description: string | null;
};
