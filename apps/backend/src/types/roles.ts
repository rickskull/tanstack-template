export const ROLES = {
  ADMIN_PRINCIPAL: 'AdminPrincipal',
  ADMIN: 'Admin',
  SELLER: 'Seller',
  BUYER: 'Buyer'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
