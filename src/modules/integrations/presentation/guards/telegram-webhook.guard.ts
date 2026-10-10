import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { CoreConfig } from 'src/core/core.config';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class TelegramWebhookGuard implements CanActivate {
  constructor(private coreConfig: CoreConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = request.headers['x-telegram-bot-api-secret-token'];

    if (secret !== this.coreConfig.telegramWebhookSecret) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: `Invalid webhook secret`,
      });
    }

    return true;
  }
}
