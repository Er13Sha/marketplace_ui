"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi, type UserProfile } from "@/entities/user";
import {
  clampCartQuantity,
  getCartCurrency,
  getCartItemsCount,
  getCartTotal,
} from "@/entities/cart";
import { cartApi, type Cart, type CartItem } from "@/entities/cart";
import { orderApi, type Order } from "@/entities/order";

export function useCartPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activeCart = await cartApi.getCart();
      setCart(activeCart);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить корзину"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndCart() {
      setIsCheckingAuth(true);
      setIsLoading(true);

      try {
        const auth = await authApi.getCurrentUser();
        if (!isMounted) {
          return;
        }

        setCurrentUser(auth.user);
        const activeCart = await cartApi.getCart();

        if (isMounted) {
          setCart(activeCart);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          setCart(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
          setIsLoading(false);
        }
      }
    }

    loadUserAndCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const itemsCount = useMemo(() => getCartItemsCount(cart), [cart]);
  const total = useMemo(() => getCartTotal(cart), [cart]);
  const currency = useMemo(() => getCartCurrency(cart), [cart]);

  const updateQuantity = async (item: CartItem, quantity: number) => {
    const nextQuantity = clampCartQuantity(quantity, item.stock);
    if (nextQuantity === item.quantity) {
      return;
    }

    setUpdatingProductId(item.product_id);
    setError(null);
    setMessage(null);

    try {
      const updatedCart =
        nextQuantity === 0
          ? await cartApi.removeItem(item.product_id)
          : await cartApi.updateItem(item.product_id, nextQuantity);

      setCart(updatedCart);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Не удалось обновить корзину"
      );
    } finally {
      setUpdatingProductId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    await updateQuantity(item, 0);
  };

  const clearCart = async () => {
    if (itemsCount === 0) {
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    setMessage(null);

    try {
      const clearedCart = await cartApi.clear();
      setCart(clearedCart);
      setMessage("Корзина очищена");
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "Не удалось очистить корзину"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const checkoutCart = async () => {
    if (itemsCount === 0) {
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    setLastOrder(null);
    setMessage(null);

    try {
      const order = await orderApi.checkout();
      const activeCart = await cartApi.getCart();

      setCart(activeCart);
      setLastOrder(order);
      setMessage(
        `Заказ ${order.id.slice(0, 8)} оформлен: ${order.items_count} позиций`
      );
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Не удалось оформить заказ"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setCart(null);
      setLastOrder(null);
      setIsLoggingOut(false);
    }
  };

  return {
    state: {
      currentUser,
      cart,
      lastOrder,
      isCheckingAuth,
      isLoading,
      updatingProductId,
      isCheckingOut,
      isLoggingOut,
      error,
      message,
    },
    summary: {
      itemsCount,
      total,
      currency,
    },
    actions: {
      loadCart,
      updateQuantity,
      removeItem,
      clearCart,
      checkoutCart,
      logout,
    },
  };
}
