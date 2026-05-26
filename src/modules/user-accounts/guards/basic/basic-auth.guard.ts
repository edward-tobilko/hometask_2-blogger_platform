// import { AuthGuard } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CoreConfig } from 'src/core/core.config';

// * Нужно инжектировать в контроллер или стратегию или гард.
@Injectable()
// export class BasicAuthGuard extends AuthGuard('basic') {}
export class BasicAuthGuard implements CanActivate {
  private readonly validUsername: string | undefined;
  private readonly validPassword: string | undefined;

  constructor(
    private reflector: Reflector,
    private coreConfig: CoreConfig,
  ) {
    // * Один раз при старте приложения — берем из .env.
    this.validUsername = this.coreConfig.adminUserName;
    this.validPassword = this.coreConfig.adminPassword;
  }

  canActivate(context: ExecutionContext): boolean {
    // * ExecutionContext позволяет переключаться между различными протоколами (HTTP, WebSocket, RPC)
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    // * Reflector читает метаданные декораторов. Если на роуте стоит @Public() — Guard сразу пропускает без проверки.
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true; // роут публичный — пропускаем (то есть энд-поинт отменяет проверку на гард)

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized, // -> 401
        message: 'unauthorized',
      });
    }

    // ? Basic Auth выглядит так: Authorization: Basic dXNlcjpwYXNz

    const base64Credentials = authHeader.split(' ')[1]; // берем "dXNlcjpwYXNz"

    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8'); // → "user:pass"

    // ? Basic Auth — это просто username:password закодированный в Base64.

    // * Используем indexOf(':') а не split(':') — потому что пароль сам может содержать :.
    const colonIndex = decoded.indexOf(':');

    const username = decoded.substring(0, colonIndex);
    const password = decoded.substring(colonIndex + 1);

    // * Сравнивает с .env и возвращает результат
    if (username === this.validUsername && password === this.validPassword) {
      return true;
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized, // -> 401
        message: 'unauthorized',
      });
    }
  }
}
