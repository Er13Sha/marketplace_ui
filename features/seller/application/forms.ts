import type { CreateProductPayload } from "@/features/catalog/domain/product";
import type {
  SellerLegalType,
  SellerProfilePayload,
} from "@/features/auth/domain/user";

export type ProductForm = {
  sku: string;
  name: string;
  priceAmount: string;
  currency: string;
  stock: string;
  categoryId: string;
  description: string;
};

export type SellerProfileForm = {
  displayName: string;
  legalType: SellerLegalType;
  taxId: string;
  phoneNumber: string;
  address: string;
  bankName: string;
  bankAccount: string;
  description: string;
};

export const initialProductForm: ProductForm = {
  sku: "",
  name: "",
  priceAmount: "",
  currency: "KZT",
  stock: "",
  categoryId: "",
  description: "",
};

export const initialSellerProfileForm: SellerProfileForm = {
  displayName: "",
  legalType: "company",
  taxId: "",
  phoneNumber: "",
  address: "",
  bankName: "",
  bankAccount: "",
  description: "",
};

const skuPattern = /^[A-Z0-9]{8,20}$/;
const phonePattern = /^\+?[0-9]{7,20}$/;

export function isProductFormValid(form: ProductForm) {
  const price = Number(form.priceAmount);
  const stock = Number(form.stock);

  return (
    skuPattern.test(form.sku) &&
    form.name.trim().length > 0 &&
    Number.isInteger(price) &&
    price > 0 &&
    Number.isInteger(stock) &&
    stock >= 0
  );
}

export function isSellerProfileFormValid(form: SellerProfileForm) {
  return (
    form.displayName.trim().length > 0 &&
    form.taxId.trim().length > 0 &&
    phonePattern.test(form.phoneNumber.trim()) &&
    form.address.trim().length > 0 &&
    form.bankAccount.trim().length > 0
  );
}

export function sanitizeSku(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
}

export function sanitizePhoneInput(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "").slice(0, 21);
}

export function sanitizeNumberInput(value: string) {
  return value.replace(/\D/g, "");
}

export function toCreateProductPayload(form: ProductForm): CreateProductPayload {
  return {
    sku: form.sku,
    name: form.name.trim(),
    priceAmount: Number(form.priceAmount),
    currency: form.currency,
    stock: Number(form.stock),
    categoryId: form.categoryId || null,
    description: form.description.trim() || null,
  };
}

export function toSellerProfilePayload(
  form: SellerProfileForm
): SellerProfilePayload {
  return {
    displayName: form.displayName.trim(),
    legalType: form.legalType,
    taxId: form.taxId.trim(),
    phoneNumber: form.phoneNumber.trim(),
    address: form.address.trim(),
    bankName: form.bankName.trim() || null,
    bankAccount: form.bankAccount.trim(),
    description: form.description.trim() || null,
  };
}
