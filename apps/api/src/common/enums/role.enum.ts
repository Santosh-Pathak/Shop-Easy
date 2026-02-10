// Align with Prisma Role enum: CUSTOMER, ADMIN, SUPER_ADMIN
export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 3,
  [Role.ADMIN]: 2,
  [Role.CUSTOMER]: 1,
};

export const roles = Object.values(Role);

export function isValidRole(value: string): value is Role {
  return roles.includes(value as Role);
}

export function hasRolePermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasAnyRole(userRole: string, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole as Role);
}
