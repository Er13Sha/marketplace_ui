"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  ALL_CATEGORIES_ID,
  productSortOptions,
  type ProductSort,
} from "@/features/catalog-filter";
import { AccountMenu } from "@/widgets/account-menu";
import {
  authPermissions,
  hasPermission,
} from "@/entities/user";
import { CartLink } from "@/widgets/cart-link";
import { formatDate, formatPrice } from "@/shared/lib";
import { useMarketplace } from "../model/use-marketplace";
import { coverImageUrl } from "@/features/product-images";

export function MarketplacePage() {
  const { state, summary, actions } = useMarketplace();

  return (
    <main className="min-h-screen bg-page text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
                HM
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">
                  Higload Market
                </p>
                <h1 className="text-2xl font-semibold tracking-normal text-text">
                  Маркетплейс товаров
                </h1>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto_auto_auto] lg:w-[820px]">
              <label className="sr-only" htmlFor="product-search">
                Поиск товаров
              </label>
              <input
                id="product-search"
                type="search"
                value={state.query}
                onChange={(event) => actions.setQuery(event.target.value)}
                placeholder="Поиск по названию, SKU или ID"
                className="h-12 rounded-md border border-border-strong bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              />

              <label className="sr-only" htmlFor="product-sort">
                Сортировка
              </label>
              <select
                id="product-sort"
                value={state.sort}
                onChange={(event) =>
                  actions.setSort(event.target.value as ProductSort)
                }
                className="h-12 rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              >
                {productSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {state.currentUser ? (
                <AccountMenu
                  email={state.currentUser.email}
                  isSeller={hasPermission(
                    state.currentUser.permissions,
                    authPermissions.catalogProductReadOwn
                  )}
                  canAccessAdmin={hasPermission(
                    state.currentUser.permissions,
                    authPermissions.adminPanelAccess
                  )}
                  isLoggingOut={state.isLoggingOut}
                  onLogout={actions.logout}
                />
              ) : (
                <Link
                  href="/login"
                  className="flex h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring"
                >
                  Войти
                </Link>
              )}

              <Link
                href="/seller"
                className="flex h-12 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Продавцу
              </Link>

              <CartLink itemsCount={summary.cartItems} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-md border border-border bg-surface p-4 lg:sticky lg:top-6 lg:self-start">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold">Backend</h2>
            <p className="mt-1 text-sm text-text-muted">
              Catalog API и Inventory API
            </p>
          </div>

          <div className="space-y-3 pt-4 text-sm text-text-soft">
            <div className="flex justify-between">
              <span>На странице</span>
              <span className="font-semibold text-text">
                {state.products.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Показано</span>
              <span className="font-semibold text-text">
                {state.filteredProducts.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Страница</span>
              <span className="font-semibold text-text">
                {state.pagination.page}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Доступно</span>
              <span className="font-semibold text-text">
                {summary.availableStock}
              </span>
            </div>
            <div className="flex justify-between">
              <span>В корзине</span>
              <span className="font-semibold text-text">
                {summary.cartItems}
              </span>
            </div>
            <div className="flex justify-between">
              <span>С категориями</span>
              <span className="font-semibold text-text">
                {summary.productsWithCategory}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <label
              className="mb-2 block text-sm font-semibold"
              htmlFor="category-filter"
            >
              Категория
            </label>
            <select
              id="category-filter"
              value={state.activeCategoryId}
              onChange={(event) =>
                actions.setActiveCategoryId(event.target.value)
              }
              className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
            >
              <option value={ALL_CATEGORIES_ID}>Все категории</option>
              {state.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Catalog products
              </p>
              <h2 className="text-xl font-semibold text-text">
                Товары из backend
              </h2>
            </div>
            <p className="text-sm text-text-muted">
              Catalog: SKU, name, description, price, category, dates.
              Inventory: stock
            </p>
          </div>

          <div className="mb-4 flex flex-col gap-3 rounded-md border border-border bg-surface px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-soft">
              <span>
                Страница{" "}
                <span className="font-semibold text-text">
                  {state.pagination.page}
                </span>
              </span>
              <span>
                Позиции{" "}
                <span className="font-semibold text-text">
                  {state.pagination.startItem}
                  {"-"}
                  {state.pagination.endItem}
                </span>
                {state.pagination.hasKnownTotal ? (
                  <>
                    <span> из </span>
                    <span className="font-semibold text-text">
                      {state.pagination.total}
                    </span>
                  </>
                ) : null}
              </span>
              <span>
                {state.pagination.hasKnownTotal
                  ? "Всего страниц"
                  : "Доступно страниц"}{" "}
                <span className="font-semibold text-text">
                  {state.pagination.totalPages}
                </span>
              </span>
              <label className="flex items-center gap-2">
                <span>На странице</span>
                <select
                  value={state.pagination.pageSize}
                  onChange={(event) =>
                    actions.setPageSize(Number(event.target.value))
                  }
                  className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                >
                  {state.pagination.pageSizeOptions.map((option) => (
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
                onClick={actions.goToPreviousPage}
                disabled={
                  state.isLoading || !state.pagination.hasPreviousPage
                }
                className="h-10 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:border-border disabled:text-disabled"
              >
                Назад
              </button>
              <div className="flex flex-wrap items-center gap-1">
                {state.pagination.pageNumbers.map((pageNumber, index) => {
                  const previousPageNumber =
                    state.pagination.pageNumbers[index - 1];
                  const isCurrentPage = pageNumber === state.pagination.page;

                  return (
                    <Fragment key={pageNumber}>
                      {previousPageNumber &&
                      pageNumber - previousPageNumber > 1 ? (
                        <span className="flex h-10 min-w-8 items-center justify-center px-1 text-sm font-semibold text-text-muted">
                          ...
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => actions.goToPage(pageNumber)}
                        aria-current={isCurrentPage ? "page" : undefined}
                        disabled={state.isLoading || isCurrentPage}
                        className="h-10 min-w-10 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-default disabled:border-primary disabled:bg-primary disabled:text-white"
                      >
                        {pageNumber}
                      </button>
                    </Fragment>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={actions.goToNextPage}
                disabled={state.isLoading || !state.pagination.hasNextPage}
                className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
              >
                Вперед
              </button>
            </div>
          </div>

          {state.error ? (
            <div className="mb-4 rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm font-medium text-error-text">
              {state.error}
            </div>
          ) : null}

          {state.operationMessage ? (
            <div className="mb-4 rounded-md border border-success-border bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
              {state.operationMessage}
            </div>
          ) : null}

          {state.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[300px] rounded-md border border-border bg-surface p-4"
                >
                  <div className="h-5 w-28 animate-pulse rounded bg-skeleton" />
                  <div className="mt-4 h-12 animate-pulse rounded bg-skeleton" />
                  <div className="mt-4 h-20 animate-pulse rounded bg-skeleton" />
                  <div className="mt-4 h-10 animate-pulse rounded bg-skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {state.filteredProducts.map((product) => {
                const isReserving = state.reservingProductId === product.id;
                const cartQuantity =
                  state.cartQuantities.get(product.id) ?? 0;
                const isUnavailable =
                  product.liveStock <= 0 ||
                  cartQuantity >= product.liveStock ||
                  isReserving;

                return (
                  <article
                    key={product.id}
                    className="rounded-md border border-border bg-surface p-4 shadow-[0_1px_2px_var(--shadow-card)]"
                  >
                    <div className="space-y-3">
                      {coverImageUrl(product) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverImageUrl(product) ?? ""} alt={product.name} className="aspect-[4/3] w-full rounded-md bg-surface-muted object-cover" loading="lazy" />
                      ) : null}
                      <div>
                        <p className="font-mono text-xs font-semibold text-text-muted">
                          {product.sku}
                        </p>
                        <h3 className="mt-1 text-base font-semibold leading-6 text-text">
                          {product.name}
                        </h3>
                      </div>

                      <p className="min-h-12 text-sm leading-6 text-text-soft">
                        {product.description || "Описание отсутствует"}
                      </p>

                      <div className="rounded-md bg-surface-muted px-3 py-2 text-sm">
                        <p className="text-xs text-text-muted">Категория</p>
                        {product.category ? (
                          <p className="mt-1 font-semibold text-text">
                            {product.category.name}
                          </p>
                        ) : (
                          <p className="mt-1 text-text-muted">Не привязана</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-y border-border py-3 text-sm">
                        <div>
                          <p className="text-xs text-text-muted">Цена</p>
                          <p className="mt-1 font-semibold">
                            {formatPrice(product.price, product.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Остаток</p>
                          <p className="mt-1 font-semibold">
                            {product.liveStock} шт.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-text-muted">
                        <div className="flex justify-between gap-3">
                          <span>Создан</span>
                          <span className="text-right">
                            {formatDate(product.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Обновлён</span>
                          <span className="text-right">
                            {formatDate(product.updated_at)}
                          </span>
                        </div>
                        <p className="break-all font-mono">ID {product.id}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => actions.addToCart(product)}
                        disabled={isUnavailable}
                        className="h-10 w-full rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-accent-disabled"
                      >
                        {isReserving
                          ? "Добавление..."
                          : product.liveStock > 0
                            ? cartQuantity > 0
                              ? cartQuantity >= product.liveStock
                                ? `В корзине ${cartQuantity} шт.`
                                : `Добавить еще (${cartQuantity})`
                              : "В корзину"
                            : "Нет в наличии"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!state.isLoading && state.filteredProducts.length > 0 ? (
            <div className="mt-5 rounded-md border border-border bg-surface px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-text-soft">
                  Страница{" "}
                  <span className="font-semibold text-text">
                    {state.pagination.page}
                  </span>
                  {state.pagination.hasKnownTotal ? (
                    <>
                      <span> из </span>
                      <span className="font-semibold text-text">
                        {state.pagination.totalPages}
                      </span>
                    </>
                  ) : null}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={actions.goToPreviousPage}
                    disabled={!state.pagination.hasPreviousPage}
                    className="h-10 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:border-border disabled:text-disabled"
                  >
                    Назад
                  </button>

                  {state.pagination.pageNumbers.map((pageNumber, index) => {
                    const previousPageNumber =
                      state.pagination.pageNumbers[index - 1];
                    const isCurrentPage =
                      pageNumber === state.pagination.page;

                    return (
                      <Fragment key={pageNumber}>
                        {previousPageNumber &&
                        pageNumber - previousPageNumber > 1 ? (
                          <span className="flex h-10 min-w-8 items-center justify-center px-1 text-sm font-semibold text-text-muted">
                            ...
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => actions.goToPage(pageNumber)}
                          aria-current={isCurrentPage ? "page" : undefined}
                          disabled={isCurrentPage}
                          className="h-10 min-w-10 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-default disabled:border-primary disabled:bg-primary disabled:text-white"
                        >
                          {pageNumber}
                        </button>
                      </Fragment>
                    );
                  })}

                  <button
                    type="button"
                    onClick={actions.goToNextPage}
                    disabled={!state.pagination.hasNextPage}
                    className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {!state.isLoading && state.filteredProducts.length === 0 ? (
            <div className="rounded-md border border-border bg-surface px-5 py-10 text-center">
              <h3 className="text-base font-semibold text-text">
                Ничего не найдено
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Измените поиск или проверьте данные в backend.
              </p>
            </div>
          ) : null}
        </section>

      </div>
    </main>
  );
}
