import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// Public route decorator
export const Public = () => SetMetadata('isPublic', true);

// Roles decorator
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Current user decorator
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
