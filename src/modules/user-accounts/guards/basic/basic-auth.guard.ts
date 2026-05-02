import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly validUsername: string | undefined;
  private readonly validPassword: string | undefined;

  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {
    this.validUsername = this.config.get('ADMIN_USERNAME');
    this.validPassword = this.config.get('ADMIN_PASSWORD');
  }

  canActivate(context: ExecutionContext): boolean {
    // * ExecutionContext позволяет переключаться между различными протоколами (HTTP, WebSocket, RPC)
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
      });
    }

    const base64Credentials = authHeader.split(' ')[1];

    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');

    const colonIndex = decoded.indexOf(':');

    const username = decoded.substring(0, colonIndex);
    const password = decoded.substring(colonIndex + 1);

    if (username === this.validUsername && password === this.validPassword) {
      return true;
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
      });
    }
  }
}
