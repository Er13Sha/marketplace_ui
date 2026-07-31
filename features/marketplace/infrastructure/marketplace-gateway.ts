import { catalogApi } from "@/features/catalog/infrastructure/catalog-api";
import { inventoryApi } from "@/features/inventory/infrastructure/inventory-api";
import type { MarketplaceCatalogGateway } from "../application/load-marketplace-catalog";

export const marketplaceCatalogGateway: MarketplaceCatalogGateway = {
  listProducts: catalogApi.listProducts,
  listCategories: catalogApi.listCategories,
  getStock: inventoryApi.getStock,
};
