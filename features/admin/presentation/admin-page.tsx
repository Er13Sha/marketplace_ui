"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { authPermissions, hasPermission } from "@/features/auth/domain/permissions";
import type { UserProfile } from "@/features/auth/domain/user";
import { authApi } from "@/features/auth/infrastructure/auth-api";
import type { Category } from "@/features/catalog/domain/category";
import type { CatalogProduct } from "@/features/catalog/domain/product";
import { catalogApi } from "@/features/catalog/infrastructure/catalog-api";
import { formatDate, formatPrice } from "@/shared/lib/format";
import type { AdminSeller } from "../domain/admin-seller";
import type { AdminSummary } from "../domain/admin-summary";
import { adminApi } from "../infrastructure/admin-api";

type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "sellers"
  | "orders"
  | "users"
  | "rbac";

const adminSections: Array<{
  id: AdminSection;
  label: string;
  marker: string;
}> = [
  { id: "dashboard", label: "Дашборд", marker: "DB" },
  { id: "products", label: "Товары", marker: "PR" },
  { id: "categories", label: "Категории", marker: "CT" },
  { id: "sellers", label: "Продавцы", marker: "SL" },
  { id: "orders", label: "Заказы", marker: "OR" },
  { id: "users", label: "Пользователи", marker: "US" },
  { id: "rbac", label: "RBAC", marker: "RB" },
];

const sectionDescriptions: Record<AdminSection, string> = {
  dashboard: "Операционная сводка marketplace.",
  products: "Модерация и управление карточками товаров.",
  categories: "Структура каталога и витрина.",
  sellers: "Профили продавцов и статусы кабинетов.",
  orders: "Заказы покупателей и операционный контроль.",
  users: "Аккаунты, роли и доступ пользователей.",
  rbac: "Роли, permissions и назначение доступа.",
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
};

type ProductFormState = {
  sku: string;
  name: string;
  priceAmount: string;
  currency: string;
  stock: string;
  categoryId: string;
  sellerId: string;
  description: string;
};

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
};

const emptyProductForm: ProductFormState = {
  sku: "",
  name: "",
  priceAmount: "",
  currency: "KZT",
  stock: "",
  categoryId: "",
  sellerId: "",
  description: "",
};

const skuPattern = /^[A-Z0-9]{8,20}$/;
const adminPageSizeOptions = [10, 20, 50] as const;
const defaultAdminPageSize = 20;

const cyrillicSlugMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function slugifyCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => cyrillicSlugMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function sanitizeSku(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
}

function sanitizeNumber(value: string): string {
  return value.replace(/\D/g, "");
}

export function AdminPage() {
  const [activeSection, setActiveSection] =
    useState<AdminSection>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [productsTotal, setProductsTotal] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [categoriesPageSize, setCategoriesPageSize] =
    useState(defaultAdminPageSize);
  const [productsPageSize, setProductsPageSize] =
    useState(defaultAdminPageSize);
  const [categoryForm, setCategoryForm] =
    useState<CategoryFormState>(emptyCategoryForm);
  const [productForm, setProductForm] =
    useState<ProductFormState>(emptyProductForm);
  const [isCategorySlugTouched, setIsCategorySlugTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isSellersLoading, setIsSellersLoading] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [sellersError, setSellersError] = useState<string | null>(null);
  const [categoryCreateSuccess, setCategoryCreateSuccess] = useState<
    string | null
  >(null);
  const [productCreateSuccess, setProductCreateSuccess] = useState<
    string | null
  >(null);

  const canAccessAdmin = useMemo(
    () =>
      currentUser
        ? hasPermission(
            currentUser.permissions,
            authPermissions.adminPanelAccess
          )
        : false,
    [currentUser]
  );

  const canCreateCategories = useMemo(
    () =>
      currentUser
        ? hasPermission(
            currentUser.permissions,
            authPermissions.catalogCategoryCreate
          )
        : false,
    [currentUser]
  );

  const canCreateProducts = useMemo(
    () =>
      currentUser
        ? hasPermission(
            currentUser.permissions,
            authPermissions.catalogProductManageAny
          )
        : false,
    [currentUser]
  );

  const loadCategories = async (
    page = categoriesPage,
    pageSize = categoriesPageSize
  ) => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const response = await catalogApi.listCategories(
        {
          limit: pageSize,
          offset: (page - 1) * pageSize,
        },
        { cache: "no-store" }
      );
      setCategories(response.items);
      setCategoriesTotal(response.total ?? response.count);
    } catch (loadError) {
      setCategoriesError(
        getErrorMessage(loadError, "Не удалось загрузить категории")
      );
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const loadProducts = async (
    page = productsPage,
    pageSize = productsPageSize
  ) => {
    setIsProductsLoading(true);
    setProductsError(null);

    try {
      const response = await catalogApi.listProducts(
        {
          limit: pageSize,
          offset: (page - 1) * pageSize,
        },
        { cache: "no-store" }
      );
      setProducts(response.items);
      setProductsTotal(response.total ?? response.count);
    } catch (loadError) {
      setProductsError(
        getErrorMessage(loadError, "Не удалось загрузить товары")
      );
    } finally {
      setIsProductsLoading(false);
    }
  };

  const loadSellers = async () => {
    setIsSellersLoading(true);
    setSellersError(null);

    try {
      const response = await adminApi.listSellers({ cache: "no-store" });
      setSellers(response.items);
    } catch (loadError) {
      setSellersError(
        getErrorMessage(loadError, "Не удалось загрузить продавцов")
      );
    } finally {
      setIsSellersLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadAdmin() {
      setIsLoading(true);
      setError(null);
      setCategoriesError(null);
      setProductsError(null);
      setSellersError(null);

      try {
        const auth = await authApi.getCurrentUser();
        if (!isMounted) {
          return;
        }

        setCurrentUser(auth.user);

        if (
          !hasPermission(auth.user.permissions, authPermissions.adminPanelAccess)
        ) {
          setSummary(null);
          return;
        }

        const [
          adminSummary,
          categoriesResponse,
          productsResponse,
          sellersResponse,
        ] =
          await Promise.all([
            adminApi.getSummary(),
            catalogApi.listCategories(
              { limit: defaultAdminPageSize, offset: 0 },
              { cache: "no-store" }
            ),
            catalogApi.listProducts(
              { limit: defaultAdminPageSize, offset: 0 },
              { cache: "no-store" }
            ),
            adminApi.listSellers({ cache: "no-store" }),
          ]);
        if (isMounted) {
          setSummary(adminSummary);
          setCategories(categoriesResponse.items);
          setCategoriesTotal(categoriesResponse.total ?? categoriesResponse.count);
          setProducts(productsResponse.items);
          setProductsTotal(productsResponse.total ?? productsResponse.count);
          setSellers(sellersResponse.items);
        }
      } catch (loadError) {
        if (isMounted) {
          setCurrentUser(null);
          setSummary(null);
          setCategories([]);
          setProducts([]);
          setSellers([]);
          setCategoriesTotal(0);
          setProductsTotal(0);
          setError(
            getErrorMessage(loadError, "Не удалось загрузить админ-панель")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setSummary(null);
      setCategories([]);
      setProducts([]);
      setSellers([]);
      setCategoriesTotal(0);
      setProductsTotal(0);
      setIsLoggingOut(false);
    }
  };

  const updateCategoryName = (name: string) => {
    setCategoryCreateSuccess(null);
    setCategoryForm((current) => ({
      ...current,
      name,
      slug: isCategorySlugTouched
        ? current.slug
        : slugifyCategoryName(name),
    }));
  };

  const updateCategorySlug = (slug: string) => {
    setCategoryCreateSuccess(null);
    setIsCategorySlugTouched(true);
    setCategoryForm((current) => ({
      ...current,
      slug: slugifyCategoryName(slug),
    }));
  };

  const updateCategoryDescription = (description: string) => {
    setCategoryCreateSuccess(null);
    setCategoryForm((current) => ({
      ...current,
      description,
    }));
  };

  const createCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoriesError(null);
    setCategoryCreateSuccess(null);

    const name = categoryForm.name.trim();
    const slug = categoryForm.slug.trim();
    const description = categoryForm.description.trim();

    if (!canCreateCategories) {
      setCategoriesError("Нет права catalog.category.create.");
      return;
    }

    if (!name || !slug) {
      setCategoriesError("Заполните название и slug категории.");
      return;
    }

    setIsCreatingCategory(true);

    try {
      const createdCategory = await catalogApi.createCategory({
        name,
        slug,
        description: description || null,
      });
      const categoriesResponse = await catalogApi.listCategories(
        { limit: categoriesPageSize, offset: 0 },
        { cache: "no-store" }
      );
      const nextCategories = categoriesResponse.items.some(
        (category) => category.id === createdCategory.id
      )
        ? categoriesResponse.items
        : [createdCategory, ...categoriesResponse.items].slice(
            0,
            categoriesPageSize
          );

      setCategoriesPage(1);
      setCategories(nextCategories);
      setCategoriesTotal(categoriesResponse.total ?? categoriesResponse.count);
      setCategoryForm(emptyCategoryForm);
      setIsCategorySlugTouched(false);
      setCategoryCreateSuccess(`Категория "${createdCategory.name}" создана.`);
    } catch (createError) {
      setCategoriesError(
        getErrorMessage(createError, "Не удалось создать категорию")
      );
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const updateProductForm = (
    field: keyof ProductFormState,
    value: string
  ) => {
    setProductCreateSuccess(null);
    setProductForm((current) => ({
      ...current,
      [field]:
        field === "sku"
          ? sanitizeSku(value)
          : field === "priceAmount" || field === "stock"
            ? sanitizeNumber(value)
            : value,
    }));
  };

  const createProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductsError(null);
    setProductCreateSuccess(null);

    const priceAmount = Number(productForm.priceAmount);
    const stock = Number(productForm.stock);
    const name = productForm.name.trim();
    const description = productForm.description.trim();

    if (!canCreateProducts) {
      setProductsError("Нет права catalog.product.manage_any.");
      return;
    }

    if (
      !skuPattern.test(productForm.sku) ||
      !name ||
      !productForm.sellerId ||
      !Number.isInteger(priceAmount) ||
      priceAmount <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setProductsError(
        "Заполните SKU 8-20 символов, название, продавца, цену и остаток."
      );
      return;
    }

    setIsCreatingProduct(true);

    try {
      await catalogApi.createProduct({
        sku: productForm.sku,
        name,
        priceAmount,
        currency: productForm.currency,
        stock,
        categoryId: productForm.categoryId || null,
        sellerId: productForm.sellerId,
        description: description || null,
      });

      const [productsResponse, adminSummary] = await Promise.all([
        catalogApi.listProducts(
          { limit: productsPageSize, offset: 0 },
          { cache: "no-store" }
        ),
        adminApi.getSummary(),
      ]);

      setProductsPage(1);
      setProducts(productsResponse.items);
      setProductsTotal(productsResponse.total ?? productsResponse.count);
      setSummary(adminSummary);
      setProductForm(emptyProductForm);
      setProductCreateSuccess(`Товар "${name}" создан.`);
    } catch (createError) {
      setProductsError(
        getErrorMessage(createError, "Не удалось создать товар")
      );
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const changeProductsPage = (page: number) => {
    setProductsPage(page);
    void loadProducts(page, productsPageSize);
  };

  const changeProductsPageSize = (pageSize: number) => {
    setProductsPageSize(pageSize);
    setProductsPage(1);
    void loadProducts(1, pageSize);
  };

  const changeCategoriesPage = (page: number) => {
    setCategoriesPage(page);
    void loadCategories(page, categoriesPageSize);
  };

  const changeCategoriesPageSize = (pageSize: number) => {
    setCategoriesPageSize(pageSize);
    setCategoriesPage(1);
    void loadCategories(1, pageSize);
  };

  const selectSection = (section: AdminSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return <AdminStatus title="Админ-панель" text="Проверка доступа" />;
  }

  if (!currentUser) {
    return (
      <AdminStatus
        title="Требуется вход"
        text="Для админ-панели нужна авторизация администратора."
        action={
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring"
          >
            Войти
          </Link>
        }
      />
    );
  }

  if (!canAccessAdmin) {
    return (
      <AdminStatus
        title="403"
        text="У аккаунта нет доступа к админ-панели."
        action={
          <Link
            href="/"
            className="flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
          >
            Маркетплейс
          </Link>
        }
      />
    );
  }

  return (
    <main className="min-h-dvh w-full overflow-hidden bg-page text-text">
      <div className="flex h-dvh w-full overflow-hidden">
        <AdminSidebar
          activeSection={activeSection}
          onSelect={selectSection}
          variant="desktop"
        />

        {isSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Закрыть меню"
              className="absolute inset-0 bg-ink/30"
              onClick={() => setIsSidebarOpen(false)}
            />
            <AdminSidebar
              activeSection={activeSection}
              onSelect={selectSection}
              variant="mobile"
            />
          </div>
        ) : null}

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Открыть меню"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-surface text-sm font-bold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring lg:hidden"
              >
                =
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-text-muted">
                  Admin
                </p>
                <h1 className="truncate text-lg font-semibold">
                  {adminSections.find((section) => section.id === activeSection)
                    ?.label ?? "Админ-панель"}
                </h1>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/"
                className="hidden h-10 items-center rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring sm:flex"
              >
                Маркетплейс
              </Link>
              <div className="hidden min-w-0 max-w-[260px] truncate rounded-md border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-text-soft md:block">
                {currentUser.email}
              </div>
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="h-10 rounded-md bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:bg-disabled"
              >
                {isLoggingOut ? "Выход..." : "Выйти"}
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
            {error ? (
              <div className="mb-4 rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm font-medium text-error-text">
                {error}
              </div>
            ) : null}

            {activeSection === "dashboard" ? (
              <AdminDashboard summary={summary} />
            ) : activeSection === "products" ? (
              <AdminProducts
                products={products}
                productsTotal={productsTotal}
                page={productsPage}
                pageSize={productsPageSize}
                categories={categories}
                sellers={sellers}
                form={productForm}
                isLoading={isProductsLoading}
                isSellersLoading={isSellersLoading}
                isCreating={isCreatingProduct}
                canCreate={canCreateProducts}
                error={productsError}
                sellersError={sellersError}
                success={productCreateSuccess}
                onRefresh={loadProducts}
                onPageChange={changeProductsPage}
                onPageSizeChange={changeProductsPageSize}
                onRefreshSellers={loadSellers}
                onSubmit={createProduct}
                onFormChange={updateProductForm}
              />
            ) : activeSection === "categories" ? (
              <AdminCategories
                categories={categories}
                categoriesTotal={categoriesTotal}
                page={categoriesPage}
                pageSize={categoriesPageSize}
                form={categoryForm}
                isLoading={isCategoriesLoading}
                isCreating={isCreatingCategory}
                canCreate={canCreateCategories}
                error={categoriesError}
                success={categoryCreateSuccess}
                onRefresh={loadCategories}
                onPageChange={changeCategoriesPage}
                onPageSizeChange={changeCategoriesPageSize}
                onSubmit={createCategory}
                onNameChange={updateCategoryName}
                onSlugChange={updateCategorySlug}
                onDescriptionChange={updateCategoryDescription}
              />
            ) : (
              <AdminPlaceholder section={activeSection} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminSidebar({
  activeSection,
  onSelect,
  variant,
}: {
  activeSection: AdminSection;
  onSelect: (section: AdminSection) => void;
  variant: "desktop" | "mobile";
}) {
  return (
    <aside
      className={`h-dvh w-[260px] shrink-0 border-r border-border bg-surface ${
        variant === "desktop"
          ? "hidden lg:flex lg:flex-col"
          : "relative z-50 flex flex-col"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
          HM
        </div>
        <div>
          <p className="text-sm font-semibold">Higload Market</p>
          <p className="text-xs font-medium text-text-muted">Admin workspace</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {adminSections.map((section) => {
            const isActive = section.id === activeSection;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-primary-ring ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-soft hover:bg-surface-muted hover:text-text"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-surface-soft text-text-muted"
                  }`}
                >
                  {section.marker}
                </span>
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function AdminDashboard({ summary }: { summary: AdminSummary | null }) {
  const counts = summary?.counts;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">Dashboard</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal">
          Операционная сводка
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Пользователи" value={counts?.users} />
        <MetricCard label="Продавцы" value={counts?.sellers} />
        <MetricCard label="Товары" value={counts?.products} />
        <MetricCard label="Заказы" value={counts?.orders} />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className="min-w-0 rounded-md border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold">Последние товары</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface-soft text-xs font-semibold uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Товар</th>
                  <th className="px-4 py-3">Продавец</th>
                  <th className="px-4 py-3">Цена</th>
                  <th className="px-4 py-3">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary?.latest_products.length ? (
                  summary.latest_products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 font-mono text-xs">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-text-soft">
                        {product.seller_name ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(product.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow colSpan={5} label="Товаров пока нет" />
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-md border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold">Последние заказы</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-surface-soft text-xs font-semibold uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Покупатель</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary?.latest_orders.length ? (
                  summary.latest_orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-text-soft">
                        {order.user_email ?? order.user_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-border bg-surface-soft px-2 py-1 text-xs font-semibold">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {formatPrice(order.total, order.currency)}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow colSpan={5} label="Заказов пока нет" />
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {summary ? (
        <p className="text-xs text-text-muted">
          Обновлено: {formatDate(summary.generated_at)}
        </p>
      ) : null}
    </div>
  );
}

function AdminProducts({
  products,
  productsTotal,
  page,
  pageSize,
  categories,
  sellers,
  form,
  isLoading,
  isSellersLoading,
  isCreating,
  canCreate,
  error,
  sellersError,
  success,
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onRefreshSellers,
  onSubmit,
  onFormChange,
}: {
  products: CatalogProduct[];
  productsTotal: number;
  page: number;
  pageSize: number;
  categories: Category[];
  sellers: AdminSeller[];
  form: ProductFormState;
  isLoading: boolean;
  isSellersLoading: boolean;
  isCreating: boolean;
  canCreate: boolean;
  error: string | null;
  sellersError: string | null;
  success: string | null;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRefreshSellers: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof ProductFormState, value: string) => void;
}) {
  const activeSellers = sellers.filter((seller) => seller.status === "active");
  const sellersById = new Map(sellers.map((seller) => [seller.id, seller]));
  const canSubmit = canCreate && activeSellers.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Товары
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
        >
          {isLoading ? "Обновление..." : "Обновить"}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm font-medium text-error-text">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-success-border bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          {success}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(340px,460px)_1fr]">
        <section className="rounded-md border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold">Новый товар</h3>
          </div>
          <form className="space-y-4 p-4" onSubmit={onSubmit}>
            {!canCreate ? (
              <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                Нет права catalog.product.manage_any.
              </div>
            ) : null}

            {canCreate && sellersError ? (
              <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                {sellersError}
              </div>
            ) : null}

            {canCreate && !isSellersLoading && activeSellers.length === 0 ? (
              <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                Нет активных продавцов для привязки товара.
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  SKU
                </span>
                <input
                  value={form.sku}
                  onChange={(event) =>
                    onFormChange("sku", event.target.value)
                  }
                  disabled={!canSubmit || isCreating}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 font-mono text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                  placeholder="PHONE001"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Название
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    onFormChange("name", event.target.value)
                  }
                  disabled={!canSubmit || isCreating}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                  placeholder="Смартфон"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end 2xl:grid-cols-1">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Продавец
                </span>
                <select
                  value={form.sellerId}
                  onChange={(event) =>
                    onFormChange("sellerId", event.target.value)
                  }
                  disabled={!canCreate || isCreating || isSellersLoading}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                >
                  <option value="">
                    {isSellersLoading ? "Загрузка продавцов..." : "Выберите продавца"}
                  </option>
                  {activeSellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={onRefreshSellers}
                disabled={isSellersLoading}
                className="h-11 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
              >
                {isSellersLoading ? "..." : "Обновить"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Цена
                </span>
                <input
                  inputMode="numeric"
                  value={form.priceAmount}
                  onChange={(event) =>
                    onFormChange("priceAmount", event.target.value)
                  }
                  disabled={!canSubmit || isCreating}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                  placeholder="150000"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Валюта
                </span>
                <select
                  value={form.currency}
                  onChange={(event) =>
                    onFormChange("currency", event.target.value)
                  }
                  disabled={!canSubmit || isCreating}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                >
                  <option value="KZT">KZT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Остаток
                </span>
                <input
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(event) =>
                    onFormChange("stock", event.target.value)
                  }
                  disabled={!canSubmit || isCreating}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                  placeholder="25"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-text-muted">
                Категория
              </span>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  onFormChange("categoryId", event.target.value)
                }
                disabled={!canSubmit || isCreating}
                className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
              >
                <option value="">Без категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-text-muted">
                Описание
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  onFormChange("description", event.target.value)
                }
                disabled={!canSubmit || isCreating}
                rows={5}
                className="mt-2 w-full resize-none rounded-md border border-border bg-surface px-3 py-3 text-sm font-medium leading-6 text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                placeholder="Описание товара"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit || isCreating}
              className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:bg-disabled"
            >
              {isCreating ? "Создание..." : "Добавить товар"}
            </button>
          </form>
        </section>

        <section className="min-w-0 rounded-md border border-border bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold">Список товаров</h3>
            <span className="rounded-md border border-border bg-surface-soft px-2 py-1 text-xs font-semibold text-text-muted">
              {productsTotal}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-surface-soft text-xs font-semibold uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Товар</th>
                  <th className="px-4 py-3">Категория</th>
                  <th className="px-4 py-3">Продавец</th>
                  <th className="px-4 py-3">Цена</th>
                  <th className="px-4 py-3">Создан</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <EmptyTableRow colSpan={6} label="Загрузка товаров..." />
                ) : products.length ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 align-top font-mono text-xs text-text-soft">
                        {product.sku}
                      </td>
                      <td className="max-w-[360px] px-4 py-3 align-top">
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 line-clamp-2 text-text-muted">
                          {product.description ?? "Описание отсутствует"}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top text-text-soft">
                        {product.category?.name ?? "Без категории"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="rounded-md border border-border bg-surface-soft px-2 py-1 text-xs font-semibold text-text-muted">
                          {product.seller_id
                            ? sellersById.get(product.seller_id)
                                ?.display_name ?? product.seller_id.slice(0, 8)
                            : "Без продавца"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top font-semibold">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="px-4 py-3 align-top text-text-muted">
                        {formatDate(product.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow colSpan={6} label="Товаров пока нет" />
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination
            total={productsTotal}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </section>
      </div>
    </div>
  );
}

function AdminCategories({
  categories,
  categoriesTotal,
  page,
  pageSize,
  form,
  isLoading,
  isCreating,
  canCreate,
  error,
  success,
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onSubmit,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
}: {
  categories: Category[];
  categoriesTotal: number;
  page: number;
  pageSize: number;
  form: CategoryFormState;
  isLoading: boolean;
  isCreating: boolean;
  canCreate: boolean;
  error: string | null;
  success: string | null;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Категории
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
        >
          {isLoading ? "Обновление..." : "Обновить"}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm font-medium text-error-text">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-success-border bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          {success}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <section className="rounded-md border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold">Новая категория</h3>
          </div>
          <form className="space-y-4 p-4" onSubmit={onSubmit}>
            {!canCreate ? (
              <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                Нет права catalog.category.create.
              </div>
            ) : null}

            <label className="block">
              <span className="text-xs font-semibold uppercase text-text-muted">
                Название
              </span>
              <input
                value={form.name}
                onChange={(event) => onNameChange(event.target.value)}
                disabled={!canCreate || isCreating}
                className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                placeholder="Смартфоны"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-text-muted">
                Slug
              </span>
              <input
                value={form.slug}
                onChange={(event) => onSlugChange(event.target.value)}
                disabled={!canCreate || isCreating}
                className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 font-mono text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                placeholder="smartfony"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-text-muted">
                Описание
              </span>
              <textarea
                value={form.description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                disabled={!canCreate || isCreating}
                rows={5}
                className="mt-2 w-full resize-none rounded-md border border-border bg-surface px-3 py-3 text-sm font-medium leading-6 text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-disabled"
                placeholder="Краткое описание для каталога"
              />
            </label>

            <button
              type="submit"
              disabled={!canCreate || isCreating}
              className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:bg-disabled"
            >
              {isCreating ? "Создание..." : "Добавить категорию"}
            </button>
          </form>
        </section>

        <section className="min-w-0 rounded-md border border-border bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold">Список категорий</h3>
            <span className="rounded-md border border-border bg-surface-soft px-2 py-1 text-xs font-semibold text-text-muted">
              {categoriesTotal}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-soft text-xs font-semibold uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Описание</th>
                  <th className="px-4 py-3">Создана</th>
                  <th className="px-4 py-3">Обновлена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <EmptyTableRow colSpan={5} label="Загрузка категорий..." />
                ) : categories.length ? (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-3 font-semibold">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-text-soft">
                        {category.slug}
                      </td>
                      <td className="max-w-[360px] px-4 py-3 text-text-soft">
                        <span className="line-clamp-2">
                          {category.description ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(category.updated_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow colSpan={5} label="Категорий пока нет" />
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination
            total={categoriesTotal}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </section>
      </div>
    </div>
  );
}

function AdminPagination({
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const firstItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(total, currentPage * pageSize);
  const canGoBack = currentPage > 1 && !isLoading;
  const canGoForward = currentPage < pageCount && !isLoading;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-text-soft lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span>
          {firstItem}-{lastItem} из {total}
        </span>
        <label className="flex items-center gap-2">
          <span className="text-text-muted">На странице</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={isLoading}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm font-semibold text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
          >
            {adminPageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!canGoBack}
          className="h-9 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:border-border disabled:text-disabled"
        >
          Первая
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoBack}
          className="h-9 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:border-border disabled:text-disabled"
        >
          Назад
        </button>
        <span className="h-9 rounded-md border border-border bg-surface-soft px-3 py-2 text-xs font-semibold text-text-muted">
          {currentPage} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoForward}
          className="h-9 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:border-border disabled:text-disabled"
        >
          Вперед
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pageCount)}
          disabled={!canGoForward}
          className="h-9 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:border-border disabled:text-disabled"
        >
          Последняя
        </button>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase text-text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-normal">
        {value ?? "-"}
      </p>
    </section>
  );
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td className="px-4 py-8 text-center text-sm text-text-muted" colSpan={colSpan}>
        {label}
      </td>
    </tr>
  );
}

function AdminPlaceholder({ section }: { section: AdminSection }) {
  const current = adminSections.find((item) => item.id === section);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary">Раздел</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal">
          {current?.label}
        </h2>
      </div>
      <section className="rounded-md border border-border bg-surface p-5">
        <p className="text-sm leading-6 text-text-soft">
          {sectionDescriptions[section]} Интерфейс управления будет подключен
          следующим этапом, текущий релиз фиксирует полноэкранный каркас и
          доступ администратора.
        </p>
      </section>
    </div>
  );
}

function AdminStatus({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-page px-4 text-text">
      <section className="w-full max-w-md rounded-md border border-border bg-surface p-5 text-center shadow-[0_1px_2px_var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
          HM
        </div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-text-soft">{text}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </section>
    </main>
  );
}
