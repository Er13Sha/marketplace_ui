import type { Category } from "./category";

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: Category | null;
  seller_id: string | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  url: string;
  position: number;
  is_cover: boolean;
};

export type ProductImageSelection = {
  token: string;
  position: number;
  isCover: boolean;
};

export type ProductWithStock = CatalogProduct & {
  liveStock: number;
};

export type ProductsResponse = {
  items: CatalogProduct[];
  count: number;
  total?: number;
  limit: number;
  offset: number;
};

export type CreateProductPayload = {
  sku: string;
  name: string;
  priceAmount: number;
  currency: string;
  stock: number;
  categoryId: string | null;
  sellerId?: string | null;
  description: string | null;
  imageUploadSessionId?: string | null;
  images?: ProductImageSelection[];
};
