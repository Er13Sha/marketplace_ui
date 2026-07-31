"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "@/features/auth/infrastructure/auth-api";
import type { UserProfile } from "@/features/auth/domain/user";
import {
  getCartItemsCount,
  getCartQuantityByProduct,
} from "@/features/cart/application/cart-summary";
import type { Cart } from "@/features/cart/domain/cart";
import { cartApi } from "@/features/cart/infrastructure/cart-api";
import {
  ALL_CATEGORIES_ID,
  filterProducts,
  type ProductSort,
} from "@/features/catalog/application/filter-products";
import type { Category } from "@/features/catalog/domain/category";
import type { ProductWithStock } from "@/features/catalog/domain/product";
import { loadMarketplaceCatalog } from "../application/load-marketplace-catalog";
import { marketplaceCatalogGateway } from "../infrastructure/marketplace-gateway";

export const marketplacePageSizeOptions = [24, 48, 96] as const;

function visiblePageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages]);

  for (let pageNumber = currentPage - 2; pageNumber <= currentPage + 2; pageNumber += 1) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      pages.add(pageNumber);
    }
  }

  return [...pages].sort((first, second) => first - second);
}

export function useMarketplace() {
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(ALL_CATEGORIES_ID);
  const [sort, setSort] = useState<ProductSort>("created-new");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(
    marketplacePageSizeOptions[0]
  );
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasKnownTotal, setHasKnownTotal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [reservingProductId, setReservingProductId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);

    try {
      const normalizedQuery = query.trim();
      const catalogData = await loadMarketplaceCatalog(
        marketplaceCatalogGateway,
        {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          query: normalizedQuery !== "" ? normalizedQuery : undefined,
          categoryId:
            activeCategoryId !== ALL_CATEGORIES_ID
              ? activeCategoryId
              : undefined,
        },
        signal
      );

      if (!signal?.aborted) {
        setError(null);
        setCategories(catalogData.categories);
        setProducts(catalogData.products);
        setHasNextPage(catalogData.page.hasNext);
        setTotalProducts(catalogData.page.total);
        setHasKnownTotal(catalogData.page.hasKnownTotal);

        const loadedTotalPages = Math.max(
          1,
          Math.ceil(catalogData.page.total / pageSize)
        );
        if (catalogData.page.hasKnownTotal && page > loadedTotalPages) {
          setPage(loadedTotalPages);
        }
      }
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить каталог"
        );
        setHasNextPage(false);
        setHasKnownTotal(false);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [activeCategoryId, page, pageSize, query]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => loadProducts(controller.signal));

    return () => controller.abort();
  }, [loadProducts]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndCart() {
      try {
        const auth = await authApi.getCurrentUser();
        if (!isMounted) {
          return;
        }

        setCurrentUser(auth.user);

        const activeCart = await cartApi.getCart();
        if (isMounted) {
          setCart(activeCart);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          setCart(null);
        }
      }
    }

    loadUserAndCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(
    () => filterProducts(products, { query, categoryId: activeCategoryId, sort }),
    [activeCategoryId, products, query, sort]
  );

  const cartQuantities = useMemo(
    () => getCartQuantityByProduct(cart),
    [cart]
  );
  const cartItems = useMemo(() => getCartItemsCount(cart), [cart]);

  const availableStock = products.reduce(
    (sum, product) => sum + product.liveStock,
    0
  );
  const productsWithCategory = products.filter((product) => product.category).length;
  const knownTotalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const totalPages =
    hasKnownTotal || !hasNextPage ? knownTotalPages : Math.max(page + 1, knownTotalPages);
  const pageNumbers = visiblePageNumbers(page, totalPages);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateActiveCategoryId = (value: string) => {
    setActiveCategoryId(value);
    setPage(1);
  };

  const updatePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setPage(Math.max(1, Math.min(totalPages, pageNumber)));
  };

  const addToCart = async (product: ProductWithStock) => {
    if (!currentUser) {
      setError("Войдите, чтобы добавить товар в корзину");
      setOperationMessage(null);
      return;
    }

    setReservingProductId(product.id);
    setError(null);
    setOperationMessage(null);

    try {
      const updatedCart = await cartApi.addItem(product.id);

      setCart(updatedCart);
      setOperationMessage(`${product.name} добавлен в корзину`);
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Не удалось добавить товар в корзину"
      );
    } finally {
      setReservingProductId(null);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setError(null);
    setOperationMessage(null);

    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setCart(null);
      setIsLoggingOut(false);
      setOperationMessage("Вы вышли из аккаунта");
    }
  };

  return {
    state: {
      query,
      activeCategoryId,
      sort,
      currentUser,
      categories,
      products,
      filteredProducts,
      cartQuantities,
      isLoading,
      isLoggingOut,
      reservingProductId,
      error,
      operationMessage,
      pagination: {
        page,
        pageSize,
        pageSizeOptions: marketplacePageSizeOptions,
        hasPreviousPage: page > 1,
        hasNextPage,
        total: totalProducts,
        hasKnownTotal,
        totalPages,
        pageNumbers,
        offset: (page - 1) * pageSize,
        startItem:
          filteredProducts.length > 0 ? (page - 1) * pageSize + 1 : 0,
        endItem: (page - 1) * pageSize + filteredProducts.length,
        shownCount: filteredProducts.length,
      },
    },
    summary: {
      cartItems,
      availableStock,
      productsWithCategory,
    },
    actions: {
      setQuery: updateQuery,
      setActiveCategoryId: updateActiveCategoryId,
      setSort,
      setPageSize: updatePageSize,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      addToCart,
      logout,
    },
  };
}
