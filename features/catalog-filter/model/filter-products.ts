import type { ProductWithStock } from "@/entities/catalog";

export const ALL_CATEGORIES_ID = "all";

export type ProductSort =
  | "created-new"
  | "stock-high"
  | "price-low"
  | "price-high";

export const productSortOptions: Array<{
  value: ProductSort;
  label: string;
}> = [
  { value: "created-new", label: "Новые" },
  { value: "stock-high", label: "Больше остаток" },
  { value: "price-low", label: "Сначала дешевле" },
  { value: "price-high", label: "Сначала дороже" },
];

type ProductFilters = {
  query: string;
  categoryId: string;
  sort: ProductSort;
};

export function filterProducts(
  products: ProductWithStock[],
  filters: ProductFilters
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return [...products]
    .filter((product) => {
      const categoryText = product.category
        ? `${product.category.name} ${product.category.slug}`.toLowerCase()
        : "";
      const matchesCategory =
        filters.categoryId === ALL_CATEGORIES_ID ||
        product.category?.id === filters.categoryId;

      return (
        matchesCategory &&
        (product.name.toLowerCase().includes(normalizedQuery) ||
          product.sku.toLowerCase().includes(normalizedQuery) ||
          product.id.toLowerCase().includes(normalizedQuery) ||
          categoryText.includes(normalizedQuery))
      );
    })
    .sort((first, second) => {
      if (filters.sort === "price-low") {
        return first.price - second.price;
      }

      if (filters.sort === "price-high") {
        return second.price - first.price;
      }

      if (filters.sort === "stock-high") {
        return second.liveStock - first.liveStock;
      }

      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    });
}
