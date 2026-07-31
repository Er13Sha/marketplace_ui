import { requestJson } from "@/shared/api/request-json";
import type {
  CategoriesResponse,
  Category,
  CreateCategoryPayload,
} from "../domain/category";
import type { CreateProductPayload, ProductsResponse } from "../domain/product";

export type ListProductsParams = {
  limit?: number;
  offset?: number;
  query?: string;
  categoryId?: string;
};

export type ListCategoriesParams = {
  limit?: number;
  offset?: number;
};

export type ImageUploadFile = {
  filename: string;
  contentType: string;
  size: number;
};

export type ImageUploadSession = {
  sessionId: string;
  expiresAt: string;
  uploads: Array<{
    token: string;
    method: "PUT";
    url: string;
    headers: Record<string, string>;
  }>;
};

function isListCategoriesParams(
  value: ListCategoriesParams | RequestInit | undefined
): value is ListCategoriesParams {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("limit" in value || "offset" in value)
  );
}

function productsPath(
  params: ListProductsParams = {},
  basePath = "/api/catalog/products"
) {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(params.limit ?? 100));
  searchParams.set("offset", String(params.offset ?? 0));

  if (params.query) {
    searchParams.set("q", params.query);
  }

  if (params.categoryId) {
    searchParams.set("categoryId", params.categoryId);
  }

  return `${basePath}?${searchParams.toString()}`;
}

function categoriesPath(params: ListCategoriesParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(params.limit ?? 100));
  searchParams.set("offset", String(params.offset ?? 0));

  return `/api/catalog/categories?${searchParams.toString()}`;
}

export const catalogApi = {
  listProducts: (params?: ListProductsParams, init?: RequestInit) =>
    requestJson<ProductsResponse>(productsPath(params), init),

  listMyProducts: (params?: ListProductsParams, init?: RequestInit) =>
    requestJson<ProductsResponse>(
      productsPath(params, "/api/catalog/products/mine"),
      init
    ),

  listCategories: (
    paramsOrInit?: ListCategoriesParams | RequestInit,
    init?: RequestInit
  ) => {
    const params = isListCategoriesParams(paramsOrInit)
      ? paramsOrInit
      : undefined;
    const requestInit = isListCategoriesParams(paramsOrInit)
      ? init
      : paramsOrInit;

    return requestJson<CategoriesResponse>(
      categoriesPath(params),
      requestInit
    );
  },

  createCategory: (payload: CreateCategoryPayload) =>
    requestJson<Category>("/api/catalog/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createProduct: (payload: CreateProductPayload) =>
    requestJson<import("../domain/product").CatalogProduct>("/api/catalog/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createImageUploadSession: (files: ImageUploadFile[]) =>
    requestJson<ImageUploadSession>("/api/catalog/product-image-uploads", {
      method: "POST",
      body: JSON.stringify({ files }),
    }),
};

export function uploadToPresignedUrl(
  upload: ImageUploadSession["uploads"][number],
  file: File,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(upload.method, upload.url);
    Object.entries(upload.headers).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${request.status}`));
      }
    };
    request.onerror = () => reject(new Error("Не удалось загрузить изображение в S3"));
    request.send(file);
  });
}
