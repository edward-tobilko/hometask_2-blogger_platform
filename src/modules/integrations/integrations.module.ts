import { Module } from '@nestjs/common';

import { GetTelegramAuthLinkUseCase } from './application/use-cases/get-telegram-auth-link.use-case';
import { IntegrationsController } from './presentation/controllers/integrations.controller';
import { HandleTelegramWebhookUseCase } from './application/use-cases/handle-telegram-webhook.use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';

@Module({
  imports: [UserAccountsModule],

  controllers: [IntegrationsController],
  providers: [GetTelegramAuthLinkUseCase, HandleTelegramWebhookUseCase],

  exports: [],
})
export class IntegrationsModule {}
