import { catalogApi } from "@/entities/catalog";
import { inventoryApi } from "@/entities/inventory";
import type { MarketplaceCatalogGateway } from "../model/load-marketplace-catalog";

export const marketplaceCatalogGateway: MarketplaceCatalogGateway = {
  listProducts: catalogApi.listProducts,
  listCategories: catalogApi.listCategories,
  getStock: inventoryApi.getStock,
};
