import type { CategoriesResponse, ListProductsParams } from "@/entities/catalog";
import type {
  ProductWithStock,
  ProductsResponse,
} from "@/entities/catalog";
import type { StockResponse } from "@/entities/inventory";

export type MarketplaceCatalogGateway = {
  listProducts: (
    params?: ListProductsParams,
    init?: RequestInit
  ) => Promise<ProductsResponse>;
  listCategories: (init?: RequestInit) => Promise<CategoriesResponse>;
  getStock: (productId: string, init?: RequestInit) => Promise<StockResponse>;
};

export async function loadMarketplaceCatalog(
  gateway: MarketplaceCatalogGateway,
  params: ListProductsParams,
  signal?: AbortSignal
) {
  const [catalog, catalogCategories] = await Promise.all([
    gateway.listProducts(params, { signal }),
    gateway.listCategories({ signal }),
  ]);

  const stockResults = await Promise.allSettled(
    catalog.items.map((product) => gateway.getStock(product.id, { signal }))
  );

  const products: ProductWithStock[] = catalog.items.map((product, index) => {
    const stockResult = stockResults[index];

    return {
      ...product,
      liveStock:
        stockResult.status === "fulfilled" ? stockResult.value.quantity : 0,
    };
  });

  const hasTotal = typeof catalog.total === "number";
  const total = hasTotal ? catalog.total ?? 0 : catalog.offset + catalog.count;

  return {
    categories: catalogCategories.items,
    products,
    page: {
      count: catalog.count,
      total,
      hasKnownTotal: hasTotal,
      limit: catalog.limit,
      offset: catalog.offset,
      hasNext: hasTotal
        ? catalog.offset + catalog.count < total
        : catalog.count >= catalog.limit,
    },
  };
}
