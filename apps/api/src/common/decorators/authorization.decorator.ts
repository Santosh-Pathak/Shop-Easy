import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const REQUIRE_ALL_PERMISSIONS_KEY = 'requireAllPermissions';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const RequireAllPermissions = () => SetMetadata(REQUIRE_ALL_PERMISSIONS_KEY, true);

export const SuperAdminOnly = () => Roles(Role.SUPER_ADMIN);
export const AdminOnly = () => Roles(Role.SUPER_ADMIN, Role.ADMIN);
export const AdminAndSuperAdmin = () => Roles(Role.SUPER_ADMIN, Role.ADMIN);
