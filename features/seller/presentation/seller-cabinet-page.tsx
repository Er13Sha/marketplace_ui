"use client";

import Link from "next/link";
import { authApi } from "@/features/auth/infrastructure/auth-api";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { ProductImagePicker, coverImageUrl } from "@/features/catalog/presentation/product-image-picker";
import type { SellerProfileForm } from "../application/forms";
import { useSellerCabinet } from "./use-seller-cabinet";

export function SellerCabinetPage() {
  const { state, summary, actions } = useSellerCabinet();

  if (state.isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4 text-text">
        <section className="w-full max-w-sm rounded-md border border-border bg-surface p-5 text-center shadow-[0_1px_2px_var(--shadow-card)]">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
            HM
          </div>
          <h1 className="text-lg font-semibold">Кабинет продавца</h1>
          <p className="mt-2 text-sm text-text-muted">Проверка сессии</p>
        </section>
      </main>
    );
  }

  if (!state.currentUser) {
    return (
      <main className="min-h-screen bg-page text-text">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
              HM
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Higload Market
              </p>
              <h1 className="text-2xl font-semibold">Кабинет продавца</h1>
            </div>
          </div>

          <section className="rounded-md border border-border bg-surface p-5 shadow-[0_1px_2px_var(--shadow-card)]">
            <div className="mb-5 grid grid-cols-2 rounded-md border border-border-strong bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => actions.setMode("login")}
                className={`h-10 rounded-md text-sm font-semibold transition ${
                  state.authMode === "login"
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Войти
              </button>
              <button
                type="button"
                onClick={() => actions.setMode("register")}
                className={`h-10 rounded-md text-sm font-semibold transition ${
                  state.authMode === "register"
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Создать
              </button>
            </div>

            <form className="space-y-4" onSubmit={actions.submitAuth}>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="seller-email"
                >
                  Email
                </label>
                <input
                  id="seller-email"
                  type="email"
                  value={state.email}
                  onChange={(event) => actions.setEmail(event.target.value)}
                  autoComplete="email"
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="seller-password"
                >
                  Пароль
                </label>
                <input
                  id="seller-password"
                  type="password"
                  value={state.password}
                  onChange={(event) => actions.setPassword(event.target.value)}
                  autoComplete={
                    state.authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                />
              </div>

              {state.authMode === "register" ? (
                <SellerProfileFields
                  form={state.sellerProfileForm}
                  onChange={actions.updateSellerProfileForm}
                />
              ) : null}

              {state.authError ? (
                <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                  {state.authError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!state.authFormValid || state.isSubmittingAuth}
                className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
              >
                {state.isSubmittingAuth
                  ? "Отправка..."
                  : state.authMode === "login"
                    ? "Войти"
                    : "Зарегистрироваться продавцом"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase text-text-muted">
                или
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <a
              href={authApi.googleStartUrl("/seller")}
              className="flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Войти через Google
            </a>
          </section>

          <div className="mt-4 flex gap-4 text-sm">
            <Link className="font-semibold text-text-soft hover:text-text" href="/">
              Маркетплейс
            </Link>
            <Link
              className="font-semibold text-text-soft hover:text-text"
              href="/login"
            >
              Покупателю
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!state.isSeller) {
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
              <h1 className="text-xl font-semibold">Кабинет продавца</h1>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-soft px-3 py-2 text-sm text-text-soft">
            {state.currentUser.email}
          </div>

          {state.authError ? (
            <div className="mt-4 rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
              {state.authError}
            </div>
          ) : null}

          <div className="mt-5">
            <SellerProfileFields
              form={state.sellerProfileForm}
              onChange={actions.updateSellerProfileForm}
            />
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={actions.becomeSeller}
              disabled={!state.sellerProfileFormValid || state.isBecomingSeller}
              className="h-11 flex-1 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {state.isBecomingSeller ? "Подключение..." : "Стать продавцом"}
            </button>
            <Link
              href="/"
              className="flex h-11 flex-1 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Маркетплейс
            </Link>
            <button
              type="button"
              onClick={actions.logout}
              className="h-11 flex-1 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
                HM
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">
                  {state.currentSeller?.display_name ?? "Higload Seller"}
                </p>
                <h1 className="text-2xl font-semibold tracking-normal">
                  Личный кабинет продавца
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-11 max-w-[240px] items-center truncate rounded-md border border-border bg-surface-soft px-3 text-sm font-semibold text-text-soft">
                {state.currentUser.email}
              </div>
              <Link
                href="/"
                className="flex h-11 items-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Маркетплейс
              </Link>
              <button
                type="button"
                onClick={() => actions.loadSellerCatalog()}
                disabled={state.isLoadingCatalog}
                className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
              >
                {state.isLoadingCatalog ? "Загрузка..." : "Обновить"}
              </button>
              <button
                type="button"
                onClick={actions.logout}
                className="h-11 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Выйти
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs font-medium uppercase text-text-muted">
                Мои товары
              </p>
              <p className="mt-1 text-xl font-semibold">
                {state.products.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs font-medium uppercase text-text-muted">
                С категориями
              </p>
              <p className="mt-1 text-xl font-semibold">
                {summary.productsWithCategory}
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs font-medium uppercase text-text-muted">
                Последний SKU
              </p>
              <p className="mt-1 text-xl font-semibold">
                {summary.latestProduct}
              </p>
            </div>
          </div>

          {state.message ? (
            <div className="rounded-md border border-success-border bg-success-bg px-3 py-2 text-sm font-medium text-success-text">
              {state.message}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-md border border-border bg-surface p-5 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-lg font-semibold">Добавить товар</h2>

          <form className="mt-5 space-y-4" onSubmit={actions.submitProduct}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="sku">
                SKU
              </label>
              <input
                id="sku"
                value={state.form.sku}
                onChange={(event) => actions.updateForm("sku", event.target.value)}
                placeholder="SELLER01"
                className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 font-mono text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="name">
                Название
              </label>
              <input
                id="name"
                value={state.form.name}
                onChange={(event) => actions.updateForm("name", event.target.value)}
                className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="price"
                >
                  Цена
                </label>
                <input
                  id="price"
                  inputMode="numeric"
                  value={state.form.priceAmount}
                  onChange={(event) =>
                    actions.updateForm("priceAmount", event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="currency"
                >
                  Валюта
                </label>
                <select
                  id="currency"
                  value={state.form.currency}
                  onChange={(event) =>
                    actions.updateForm("currency", event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                >
                  <option value="KZT">KZT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="stock"
                >
                  Остаток
                </label>
                <input
                  id="stock"
                  inputMode="numeric"
                  value={state.form.stock}
                  onChange={(event) =>
                    actions.updateForm("stock", event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="category"
                >
                  Категория
                </label>
                <select
                  id="category"
                  value={state.form.categoryId}
                  onChange={(event) =>
                    actions.updateForm("categoryId", event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
                >
                  <option value="">Без категории</option>
                  {state.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="description"
              >
                Описание
              </label>
              <textarea
                id="description"
                value={state.form.description}
                onChange={(event) =>
                  actions.updateForm("description", event.target.value)
                }
                rows={4}
                className="w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              />
            </div>

            <ProductImagePicker
              images={state.productImages}
              disabled={state.isSubmittingProduct}
              onFiles={actions.addProductImages}
              onRemove={actions.removeProductImage}
              onMove={actions.moveProductImage}
              onCover={actions.setProductImageCover}
            />

            {state.productError ? (
              <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                {state.productError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!state.productFormValid || state.isSubmittingProduct}
              className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {state.isSubmittingProduct ? "Сохранение..." : "Выставить товар"}
            </button>
          </form>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Seller products
              </p>
              <h2 className="text-xl font-semibold">Мои товары</h2>
            </div>
            <p className="text-sm text-text-muted">
              {state.isLoadingCatalog
                ? "Загрузка..."
                : `${state.products.length} записей`}
            </p>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-xs uppercase text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SKU</th>
                    <th className="px-4 py-3 font-semibold">Название</th>
                    <th className="px-4 py-3 font-semibold">Категория</th>
                    <th className="px-4 py-3 font-semibold">Цена</th>
                    <th className="px-4 py-3 font-semibold">Создан</th>
                  </tr>
                </thead>
                <tbody>
                  {state.isLoadingCatalog ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-t border-border">
                        {Array.from({ length: 5 }).map((__, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-4">
                            <div className="h-4 animate-pulse rounded bg-skeleton" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : state.products.length > 0 ? (
                    state.products.map((product) => (
                      <tr key={product.id} className="border-t border-border">
                        <td className="px-4 py-4 align-top">
                          <span className="font-mono text-xs font-semibold text-text-muted">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex gap-3">
                            {coverImageUrl(product) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={coverImageUrl(product) ?? ""} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
                            ) : null}
                            <div>
                              <p className="font-semibold text-text">{product.name}</p>
                              <p className="mt-1 line-clamp-2 max-w-md text-text-muted">{product.description || "Описание отсутствует"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-text-soft">
                          {product.category?.name ?? "Без категории"}
                        </td>
                        <td className="px-4 py-4 align-top font-semibold">
                          {formatPrice(product.price, product.currency)}
                        </td>
                        <td className="px-4 py-4 align-top text-text-muted">
                          {formatDate(product.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="border-t border-border px-4 py-8 text-center text-sm text-text-muted"
                      >
                        У продавца пока нет товаров
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type SellerProfileFieldsProps = {
  form: SellerProfileForm;
  onChange: (field: keyof SellerProfileForm, value: string) => void;
};

function SellerProfileFields({ form, onChange }: SellerProfileFieldsProps) {
  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="seller-display-name"
        >
          Название магазина
        </label>
        <input
          id="seller-display-name"
          value={form.displayName}
          onChange={(event) => onChange("displayName", event.target.value)}
          className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="seller-legal-type"
          >
            Тип продавца
          </label>
          <select
            id="seller-legal-type"
            value={form.legalType}
            onChange={(event) => onChange("legalType", event.target.value)}
            className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
          >
            <option value="company">Компания</option>
            <option value="individual">ИП / физлицо</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="seller-tax">
            ИИН / БИН
          </label>
          <input
            id="seller-tax"
            value={form.taxId}
            onChange={(event) => onChange("taxId", event.target.value)}
            className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="seller-phone"
          >
            Телефон
          </label>
          <input
            id="seller-phone"
            value={form.phoneNumber}
            onChange={(event) => onChange("phoneNumber", event.target.value)}
            placeholder="+77001234567"
            className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="seller-bank-account"
          >
            Банковский счёт
          </label>
          <input
            id="seller-bank-account"
            value={form.bankAccount}
            onChange={(event) => onChange("bankAccount", event.target.value)}
            className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="seller-address"
        >
          Адрес
        </label>
        <input
          id="seller-address"
          value={form.address}
          onChange={(event) => onChange("address", event.target.value)}
          className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="seller-bank-name"
        >
          Банк
        </label>
        <input
          id="seller-bank-name"
          value={form.bankName}
          onChange={(event) => onChange("bankName", event.target.value)}
          className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="seller-description"
        >
          Описание
        </label>
        <textarea
          id="seller-description"
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
        />
      </div>
    </div>
  );
}
