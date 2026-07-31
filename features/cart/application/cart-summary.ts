import type { Cart } from "../domain/cart";

export function getCartQuantityByProduct(cart: Cart | null) {
  return new Map(
    (cart?.items ?? []).map((item) => [item.product_id, item.quantity])
  );
}

export function getCartItemsCount(cart: Cart | null) {
  return cart?.items_count ?? 0;
}

export function getCartTotal(cart: Cart | null) {
  return cart?.total ?? 0;
}

export function getCartCurrency(cart: Cart | null) {
  return cart?.currency ?? "KZT";
}

export function clampCartQuantity(quantity: number, stock: number) {
  return Math.max(0, Math.min(quantity, stock));
}
