"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  authPermissions,
  hasPermission,
} from "@/entities/user";
import { authApi, type SellerProfile, type UserProfile } from "@/entities/user";
import { formatDate } from "@/shared/lib";

type AccountState = {
  user: UserProfile | null;
  seller: SellerProfile | null;
};

export function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountState>({
    user: null,
    seller: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      setIsLoading(true);
      setError(null);

      try {
        const auth = await authApi.getCurrentUser();
        if (isMounted) {
          setAccount({
            user: auth.user,
            seller: auth.seller,
          });
        }
      } catch {
        if (isMounted) {
          setAccount({
            user: null,
            seller: null,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await authApi.logout();
      router.push("/");
      router.refresh();
    } catch (logoutError) {
      setError(
        logoutError instanceof Error ? logoutError.message : "Не удалось выйти"
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4 text-text">
        <section className="w-full max-w-sm rounded-md border border-border bg-surface p-5 text-center shadow-[0_1px_2px_var(--shadow-card)]">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-base font-bold text-white">
            HM
          </div>
          <h1 className="text-lg font-semibold">Личный кабинет</h1>
          <p className="mt-2 text-sm text-text-muted">Проверка сессии</p>
        </section>
      </main>
    );
  }

  if (!account.user) {
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
              <h1 className="text-xl font-semibold">Личный кабинет</h1>
            </div>
          </div>
          <p className="text-sm leading-6 text-text-soft">
            Для просмотра личного кабинета нужна авторизация.
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
          <a
            href={authApi.googleStartUrl("/account")}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
          >
            Войти через Google
          </a>
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
                  Личный кабинет
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="flex h-11 items-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Маркетплейс
              </Link>
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:bg-disabled"
              >
                {isLoggingOut ? "Выход..." : "Выйти"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm font-medium text-error-text">
              {error}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section className="min-w-0 rounded-md border border-border bg-surface p-5 shadow-[0_1px_2px_var(--shadow-card)]">
          <p className="text-sm font-medium text-primary">Profile</p>
          <h2 className="mt-1 text-xl font-semibold">Данные аккаунта</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <dt className="text-xs font-semibold uppercase text-text-muted">
                Email
              </dt>
              <dd className="mt-1 break-all text-sm font-semibold">
                {account.user.email}
              </dd>
            </div>
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <dt className="text-xs font-semibold uppercase text-text-muted">
                Телефон
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {account.user.phone_number ?? "-"}
              </dd>
            </div>
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <dt className="text-xs font-semibold uppercase text-text-muted">
                Роли
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {account.user.roles.join(", ")}
              </dd>
            </div>
            <div className="rounded-md border border-border bg-surface-soft px-4 py-3">
              <dt className="text-xs font-semibold uppercase text-text-muted">
                Регистрация
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {formatDate(account.user.created_at)}
              </dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-md border border-border bg-surface p-5 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-base font-semibold">Разделы</h2>
          <div className="mt-4 space-y-2">
            <Link
              href="/cart"
              className="flex h-11 items-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Корзина
            </Link>
            <Link
              href="/seller"
              className="flex h-11 items-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              {account.seller ? "Кабинет продавца" : "Стать продавцом"}
            </Link>
            {hasPermission(
              account.user.permissions,
              authPermissions.adminPanelAccess
            ) ? (
              <Link
                href="/admin"
                className="flex h-11 items-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
              >
                Админ-панель
              </Link>
            ) : null}
          </div>

          {account.seller ? (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase text-text-muted">
                Продавец
              </p>
              <p className="mt-1 text-sm font-semibold">
                {account.seller.display_name}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Статус: {account.seller.status}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
