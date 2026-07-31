export const authPermissions = {
  adminPanelAccess: "admin.panel.access",
  catalogCategoryCreate: "catalog.category.create",
  sellerProfileCreate: "seller.profile.create",
  catalogProductReadOwn: "catalog.product.read_own",
  catalogProductManageAny: "catalog.product.manage_any",
} as const;

export function hasPermission(
  permissions: string[],
  permission: string
): boolean {
  return permissions.includes(permission);
}
