import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: unknown, user: { id: string } | null): any {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'You are not authorized',
      });
    }

    return user;
  }
}
