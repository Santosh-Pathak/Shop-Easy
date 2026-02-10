import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  ROLES_KEY,
  PERMISSIONS_KEY,
  REQUIRE_ALL_PERMISSIONS_KEY,
} from '../decorators/authorization.decorator';
import { Role } from '../enums/role.enum';
import {
  Permission,
  hasAnyPermission,
  hasAllPermissions,
} from '../enums/permission.enum';

@Injectable()
export class AuthorizationGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles?.length > 0) {
      const hasRole = requiredRoles.includes(user.role as Role);
      if (!hasRole) {
        this.logger.warn(
          `Access denied for user ${user.userId ?? user.sub} with role ${user.role}. Required: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException(
          `Insufficient permissions. Required role: ${requiredRoles.join(' or ')}`,
        );
      }
    }

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredPermissions?.length > 0) {
      const requireAll = this.reflector.getAllAndOverride<boolean>(REQUIRE_ALL_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const hasAccess = requireAll
        ? hasAllPermissions(user.role, requiredPermissions)
        : hasAnyPermission(user.role, requiredPermissions);
      if (!hasAccess) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.join(requireAll ? ' and ' : ' or ')}`,
        );
      }
    }

    return true;
  }

  handleRequest<TUser = Express.User>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
  ): TUser {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
