"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "@/entities/user";
import type {
  SellerLegalType,
  SellerProfile,
  UserProfile,
} from "@/entities/user";
import { catalogApi, uploadToPresignedUrl, type Category, type CatalogProduct } from "@/entities/catalog";
import {
  MAX_PRODUCT_IMAGES,
  MAX_PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_TYPES,
  type PendingProductImage,
} from "@/features/product-images";
import {
  initialProductForm,
  initialSellerProfileForm,
  isProductFormValid,
  isSellerProfileFormValid,
  sanitizeNumberInput,
  sanitizePhoneInput,
  sanitizeSku,
  toCreateProductPayload,
  toSellerProfilePayload,
  type ProductForm,
  type SellerProfileForm,
} from "./forms";

type AuthMode = "login" | "register";

export function useSellerCabinet() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentSeller, setCurrentSeller] = useState<SellerProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(initialProductForm);
  const [productImages, setProductImages] = useState<PendingProductImage[]>([]);
  const [sellerProfileForm, setSellerProfileForm] = useState<SellerProfileForm>(
    initialSellerProfileForm
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isBecomingSeller, setIsBecomingSeller] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isSeller = currentSeller?.status === "active";
  const sellerProfileFormValid = useMemo(
    () => isSellerProfileFormValid(sellerProfileForm),
    [sellerProfileForm]
  );
  const authFormValid =
    email.trim().length > 3 &&
    password.length >= 8 &&
    (authMode === "login" || sellerProfileFormValid);
  const productFormValid = useMemo(() => isProductFormValid(form), [form]);

  const checkAuth = useCallback(async () => {
    setIsCheckingAuth(true);

    try {
      const auth = await authApi.getCurrentUser();
      setCurrentUser(auth.user);
      setCurrentSeller(auth.seller);
    } catch {
      setCurrentUser(null);
      setCurrentSeller(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const loadSellerCatalog = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoadingCatalog(true);
      setProductError(null);

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          catalogApi.listCategories({ signal }),
          catalogApi.listMyProducts({ limit: 100 }, { signal }),
        ]);

        if (!signal?.aborted) {
          setCategories(categoriesResponse.items);
          setProducts(productsResponse.items);
        }
      } catch (loadError) {
        if (!signal?.aborted) {
          setProductError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить кабинет продавца"
          );
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoadingCatalog(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      checkAuth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [checkAuth]);

  useEffect(() => {
    if (!currentUser || !isSeller) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadSellerCatalog(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentUser, isSeller, loadSellerCatalog]);

  const setMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError(null);
  };

  const updateForm = (field: keyof ProductForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]:
        field === "sku"
          ? sanitizeSku(value)
          : field === "priceAmount" || field === "stock"
            ? sanitizeNumberInput(value)
            : value,
    }));
  };

  const addProductImages = (files: File[]) => {
    setProductError(null);
    const available = MAX_PRODUCT_IMAGES - productImages.length;
    const accepted = files.slice(0, available);
    if (files.length > available) {
      setProductError("Можно добавить не более 10 фотографий");
      return;
    }
    if (accepted.some((file) => !PRODUCT_IMAGE_TYPES.includes(file.type) || file.size < 1 || file.size > MAX_PRODUCT_IMAGE_SIZE)) {
      setProductError("Допустимы JPEG, PNG и WebP размером до 10 МБ");
      return;
    }
    setProductImages((current) => [
      ...current,
      ...accepted.map((file, index) => ({
        clientId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isCover: current.length === 0 && index === 0,
        progress: 0,
      })),
    ]);
  };

  const removeProductImage = (clientId: string) => {
    setProductImages((current) => {
      const removed = current.find((image) => image.clientId === clientId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = current.filter((image) => image.clientId !== clientId);
      if (removed?.isCover && next[0]) next[0] = { ...next[0], isCover: true };
      return next;
    });
  };

  const moveProductImage = (clientId: string, direction: -1 | 1) => {
    setProductImages((current) => {
      const index = current.findIndex((image) => image.clientId === clientId);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const setProductImageCover = (clientId: string) => {
    setProductImages((current) => current.map((image) => ({ ...image, isCover: image.clientId === clientId })));
  };

  const updateSellerProfileForm = (
    field: keyof SellerProfileForm,
    value: string
  ) => {
    setSellerProfileForm((current) => ({
      ...current,
      [field]:
        field === "phoneNumber"
          ? sanitizePhoneInput(value)
          : field === "legalType"
            ? (value as SellerLegalType)
            : value,
    }));
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authFormValid) {
      setAuthError("Введите email и пароль минимум 8 символов");
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError(null);
    setMessage(null);

    try {
      const normalizedEmail = email.trim();

      if (authMode === "register") {
        await authApi.register(
          normalizedEmail,
          password,
          "seller",
          toSellerProfilePayload(sellerProfileForm)
        );
      }

      const auth = await authApi.login(normalizedEmail, password);
      setCurrentUser(auth.user);
      setCurrentSeller(auth.seller);
      setEmail("");
      setPassword("");
      setSellerProfileForm(initialSellerProfileForm);
    } catch (submitError) {
      setAuthError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось войти в кабинет"
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const becomeSeller = async () => {
    if (!sellerProfileFormValid) {
      setAuthError("Заполните данные продавца");
      return;
    }

    setIsBecomingSeller(true);
    setAuthError(null);
    setMessage(null);

    try {
      const auth = await authApi.becomeSeller(
        toSellerProfilePayload(sellerProfileForm)
      );
      setCurrentUser(auth.user);
      setCurrentSeller(auth.seller);
      setSellerProfileForm(initialSellerProfileForm);
      setMessage("Роль продавца включена");
    } catch (sellerError) {
      setAuthError(
        sellerError instanceof Error
          ? sellerError.message
          : "Не удалось включить кабинет продавца"
      );
    } finally {
      setIsBecomingSeller(false);
    }
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productFormValid || !currentUser) {
      setProductError("Проверьте SKU, цену и остаток");
      return;
    }

    setIsSubmittingProduct(true);
    setProductError(null);
    setMessage(null);

    try {
      let imagePayload: Pick<import("@/entities/catalog").CreateProductPayload, "imageUploadSessionId" | "images"> = {};
      if (productImages.length > 0) {
        const session = await catalogApi.createImageUploadSession(productImages.map((image) => ({
          filename: image.file.name,
          contentType: image.file.type,
          size: image.file.size,
        })));
        await Promise.all(session.uploads.map((upload, index) => uploadToPresignedUrl(upload, productImages[index].file, (progress) => {
          setProductImages((current) => current.map((image) => image.clientId === productImages[index].clientId ? { ...image, progress } : image));
        })));
        imagePayload = {
          imageUploadSessionId: session.sessionId,
          images: session.uploads.map((upload, position) => ({ token: upload.token, position, isCover: productImages[position].isCover })),
        };
      }

      await catalogApi.createProduct({ ...toCreateProductPayload(form), ...imagePayload });
      setMessage(`Товар ${form.sku} добавлен в продажу`);
      setForm(initialProductForm);
      productImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setProductImages([]);
      await loadSellerCatalog();
    } catch (submitError) {
      setProductError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось добавить товар"
      );
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Session can already be expired; local state is still cleared.
    }

    setCurrentUser(null);
    setCurrentSeller(null);
    setProducts([]);
    productImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setProductImages([]);
    setMessage(null);
    setAuthError(null);
    setProductError(null);
  };

  const productsWithCategory = products.filter((product) => product.category).length;
  const latestProduct = products.at(0)?.sku ?? "-";

  return {
    state: {
      authMode,
      email,
      password,
      currentUser,
      currentSeller,
      categories,
      products,
      form,
      productImages,
      sellerProfileForm,
      isSeller,
      isCheckingAuth,
      isLoadingCatalog,
      isSubmittingAuth,
      isBecomingSeller,
      isSubmittingProduct,
      authError,
      productError,
      message,
      authFormValid,
      productFormValid,
      sellerProfileFormValid,
    },
    summary: {
      productsWithCategory,
      latestProduct,
    },
    actions: {
      setMode,
      setEmail,
      setPassword,
      updateForm,
      addProductImages,
      removeProductImage,
      moveProductImage,
      setProductImageCover,
      updateSellerProfileForm,
      submitAuth,
      becomeSeller,
      submitProduct,
      logout,
      loadSellerCatalog,
    },
  };
}
