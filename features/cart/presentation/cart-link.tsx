import Link from "next/link";

type CartLinkProps = {
  itemsCount: number;
};

export function CartLink({ itemsCount }: CartLinkProps) {
  return (
    <Link
      aria-label={`Корзина, товаров: ${itemsCount}`}
      className="relative flex h-12 w-12 items-center justify-center rounded-md border border-border-strong bg-surface text-text-soft transition hover:border-primary/60 hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
      href="/cart"
      title="Корзина"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21.5 7H6" />
      </svg>
      <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold leading-5 text-white">
        {itemsCount > 99 ? "99+" : itemsCount}
      </span>
    </Link>
  );
}
