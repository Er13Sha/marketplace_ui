export type UserProfile = {
  id: string;
  email: string;
  phone_number: string | null;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
};

export type SellerLegalType = "individual" | "company";

export type SellerProfilePayload = {
  displayName: string;
  legalType: SellerLegalType;
  taxId: string;
  phoneNumber: string;
  address: string;
  bankName: string | null;
  bankAccount: string;
  description: string | null;
};

export type SellerProfile = {
  id: string;
  owner_user_id: string;
  display_name: string;
  legal_type: SellerLegalType;
  tax_id: string;
  phone_number: string;
  address: string;
  bank_name: string | null;
  bank_account: string;
  description: string | null;
  status: "active";
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: UserProfile;
  seller: SellerProfile | null;
};
