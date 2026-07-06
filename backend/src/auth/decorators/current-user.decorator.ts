import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserDocument } from '../../users/schemas/user.schema';

interface RequestWithUser {
  user: UserDocument;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
