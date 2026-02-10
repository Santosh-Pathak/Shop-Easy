import { Role } from './role.enum';

export enum Permission {
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_LIST = 'user:list',
  PROFILE_READ = 'profile:read',
  PROFILE_UPDATE = 'profile:update',
  FILE_UPLOAD = 'file:upload',
  FILE_DELETE = 'file:delete',
  FILE_READ = 'file:read',
  AUTH_MANAGE_TOKENS = 'auth:manage-tokens',
  AUTH_VERIFY_EMAIL = 'auth:verify-email',
  ADMIN_ACCESS = 'admin:access',
  ADMIN_SETTINGS = 'admin:settings',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_LIST,
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
    Permission.FILE_READ,
    Permission.AUTH_MANAGE_TOKENS,
    Permission.ADMIN_ACCESS,
  ],
  [Role.CUSTOMER]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.FILE_READ,
    Permission.AUTH_VERIFY_EMAIL,
  ],
};

export const roleRights = new Map(Object.entries(ROLE_PERMISSIONS));

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.some((p) => rolePermissions.includes(p));
}

export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.every((p) => rolePermissions.includes(p));
}
