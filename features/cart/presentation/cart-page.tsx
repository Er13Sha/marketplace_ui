"use client";

import Link from "next/link";
import {
  authPermissions,
  hasPermission,
} from "@/features/auth/domain/permissions";
import { AccountMenu } from "@/features/auth/presentation/account-menu";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { CartLink } from "./cart-link";
import { useCartPage } from "./use-cart-page";

export function CartPage() {
  const { state, summary, actions } = useCartPage();
  const items = state.cart?.items ?? [];

  if (state.isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4 text-text">
        <div className="w-full max-w-sm rounded-md border border-border bg-surface p-5 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
            HM
          </div>
          <h1 className="text-lg font-semibold">Проверка сессии</h1>
          <p className="mt-2 text-sm text-text-muted">Загрузка корзины</p>
        </div>
      </main>
    );
  }

  if (!state.currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4 text-text">
        <section className="w-full max-w-md rounded-md border border-border bg-surface p-5 shadow-[0_1px_2px_var(--shadow-card)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
              HM
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Higload Market
              </p>
              <h1 className="text-xl font-semibold">Корзина</h1>
            </div>
          </div>
          <p className="text-sm leading-6 text-text-soft">
            Для просмотра корзины и оформления заказа нужна авторизация.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/login"
              className="flex h-11 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Войти
            </Link>
            <Link
              href="/"
              className="flex h-11 flex-1 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Маркетплейс
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
                HM
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">
                  Higload Market
                </p>
                <h1 className="text-2xl font-semibold tracking-normal">
                  Корзина
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="flex h-12 items-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Маркетплейс
              </Link>
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
                className="w-[220px] max-w-full"
                onLogout={actions.logout}
              />
              <CartLink itemsCount={summary.itemsCount} />
            </div>
          </div>

          {state.error ? (
            <div className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm font-medium text-error-text">
              {state.error}
            </div>
          ) : null}

          {state.message ? (
            <div className="rounded-md border border-success-border bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
              {state.message}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Checkout
              </p>
              <h2 className="text-xl font-semibold">Товары в корзине</h2>
            </div>
            <button
              type="button"
              onClick={actions.loadCart}
              className="h-10 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
              disabled={state.isLoading}
            >
              {state.isLoading ? "Загрузка..." : "Обновить"}
            </button>
          </div>

          {state.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 rounded-md border border-border bg-surface p-4"
                >
                  <div className="h-5 w-32 animate-pulse rounded bg-skeleton" />
                  <div className="mt-4 h-8 animate-pulse rounded bg-skeleton" />
                  <div className="mt-4 h-10 animate-pulse rounded bg-skeleton" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => {
                const isUpdating = state.updatingProductId === item.product_id;
                const canDecrease = item.quantity > 1 && !isUpdating;
                const canIncrease = item.quantity < item.stock && !isUpdating;

                return (
                  <article
                    key={item.product_id}
                    className="rounded-md border border-border bg-surface p-4 shadow-[0_1px_2px_var(--shadow-card)]"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-text-muted">
                          {item.sku}
                        </p>
                        <h3 className="mt-1 text-base font-semibold leading-6">
                          {item.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-soft">
                          {item.description || "Описание отсутствует"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                          <span className="rounded bg-surface-muted px-2 py-1">
                            {item.category?.name ?? "Без категории"}
                          </span>
                          <span className="rounded bg-surface-muted px-2 py-1">
                            Остаток: {item.stock} шт.
                          </span>
                          <span className="rounded bg-surface-muted px-2 py-1">
                            Обновлён: {formatDate(item.updated_at)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-md border border-border bg-surface-soft p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-muted">Цена</span>
                          <span className="font-semibold">
                            {formatPrice(item.price, item.currency)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm text-text-muted">
                            Количество
                          </span>
                          <div className="flex items-center rounded-md border border-border-strong bg-surface">
                            <button
                              type="button"
                              aria-label={`Уменьшить количество ${item.sku}`}
                              className="h-9 w-9 text-base font-semibold text-text-soft transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-disabled"
                              disabled={!canDecrease}
                              onClick={() =>
                                actions.updateQuantity(item, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <span className="flex h-9 min-w-10 items-center justify-center border-x border-border-strong px-3 text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Увеличить количество ${item.sku}`}
                              className="h-9 w-9 text-base font-semibold text-text-soft transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-disabled"
                              disabled={!canIncrease}
                              onClick={() =>
                                actions.updateQuantity(item, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                          <span className="text-text-muted">Итого</span>
                          <span className="font-semibold">
                            {formatPrice(item.line_total, item.currency)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="mt-3 h-10 w-full rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
                          disabled={isUpdating}
                          onClick={() => actions.removeItem(item)}
                        >
                          {isUpdating ? "Обновление..." : "Удалить"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-border bg-surface px-5 py-10 text-center">
              <h3 className="text-base font-semibold">Корзина пустая</h3>
              <p className="mt-2 text-sm text-text-muted">
                Добавьте товары из каталога, чтобы оформить заказ.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Перейти в каталог
              </Link>
            </div>
          )}
        </section>

        <aside className="rounded-md border border-border bg-surface p-4 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-base font-semibold">Оформление</h2>
          <div className="mt-4 space-y-3 border-b border-border pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Позиций</span>
              <span className="font-semibold">{summary.itemsCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Сумма</span>
              <span className="font-semibold">
                {formatPrice(summary.total, summary.currency)}
              </span>
            </div>
          </div>

          {state.lastOrder ? (
            <div className="mt-4 rounded-md border border-success-border bg-success-bg p-3">
              <p className="text-xs font-medium uppercase text-success-text">
                Последний заказ
              </p>
              <p className="mt-1 break-all font-mono text-xs font-semibold">
                {state.lastOrder.id}
              </p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-text-muted">Статус</span>
                <span className="font-semibold">{state.lastOrder.status}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-text-muted">Сумма</span>
                <span className="font-semibold">
                  {formatPrice(state.lastOrder.total, state.lastOrder.currency)}
                </span>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled={summary.itemsCount === 0 || state.isCheckingOut}
            onClick={actions.checkoutCart}
            className="mt-4 h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink-hover focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {state.isCheckingOut ? "Оформление..." : "Оформить заказ"}
          </button>

          <button
            type="button"
            disabled={summary.itemsCount === 0 || state.isCheckingOut}
            onClick={actions.clearCart}
            className="mt-2 h-10 w-full rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:text-disabled"
          >
            Очистить корзину
          </button>
        </aside>
      </div>
    </main>
  );
}
