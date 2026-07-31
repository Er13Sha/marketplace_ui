"use client";

import Link from "next/link";

type AccountMenuProps = {
  email: string;
  isSeller: boolean;
  canAccessAdmin?: boolean;
  isLoggingOut?: boolean;
  className?: string;
  onLogout: () => void | Promise<void>;
};

export function AccountMenu({
  email,
  isSeller,
  canAccessAdmin = false,
  isLoggingOut = false,
  className = "",
  onLogout,
}: AccountMenuProps) {
  return (
    <div className={`group relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        className="flex h-12 w-full min-w-0 items-center justify-center truncate rounded-md border border-border bg-surface-soft px-3 text-sm font-semibold text-text-soft transition hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary-ring"
      >
        <span className="truncate">{email}</span>
      </button>

      <div
        role="menu"
        className="invisible absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-md border border-border bg-surface opacity-0 shadow-[0_12px_32px_var(--shadow-card)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <div className="border-b border-border bg-surface-soft px-4 py-3">
          <p className="truncate text-sm font-semibold text-text">{email}</p>
        </div>
        <div className="p-2">
          <Link
            href="/account"
            role="menuitem"
            className="flex h-10 items-center rounded-md px-3 text-sm font-semibold text-text-soft transition hover:bg-surface-muted hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
          >
            Личный кабинет
          </Link>
          <Link
            href="/seller"
            role="menuitem"
            className="flex h-10 items-center rounded-md px-3 text-sm font-semibold text-text-soft transition hover:bg-surface-muted hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
          >
            {isSeller ? "Кабинет продавца" : "Стать продавцом"}
          </Link>
          {canAccessAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              className="flex h-10 items-center rounded-md px-3 text-sm font-semibold text-text-soft transition hover:bg-surface-muted hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
            >
              Админ-панель
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex h-10 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-error-text transition hover:bg-error-bg focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-wait disabled:text-disabled"
          >
            {isLoggingOut ? "Выход..." : "Выйти"}
          </button>
        </div>
      </div>
    </div>
  );
}
