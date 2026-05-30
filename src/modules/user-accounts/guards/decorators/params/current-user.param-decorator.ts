import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export const CurrentUserFromRequest = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): { id: string; deviceId: string } => {
    const request = context.switchToHttp().getRequest<Request>();

    const currentUser = request.user;

    if (!currentUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'There is no user in the request object!',
      });
    }

    return currentUser as { id: string; deviceId: string };
  },
);

// * Декоратор для анонимных запроссов (что бы избежать request.user -> undefined -> 401)
export const CurrentUserOptionalFromRequest = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): { id: string; deviceId: string } | null => {
    const request = context.switchToHttp().getRequest<Request>();

    return (request.user as { id: string; deviceId: string }) ?? null;
  },
);
