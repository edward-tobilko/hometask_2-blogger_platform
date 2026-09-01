import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TelegramWebhookDto } from '../../presentation/input-dto/telegram-webhook.input-dto';
import { UsersSqlExternalRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql-external.repository';

export class HandleTelegramWebhookCommand {
  constructor(public readonly dto: TelegramWebhookDto) {}
}

@CommandHandler(HandleTelegramWebhookCommand)
export class HandleTelegramWebhookUseCase implements ICommandHandler<
  HandleTelegramWebhookCommand,
  void
> {
  constructor(private usersExternalRepo: UsersSqlExternalRepository) {}

  async execute({ dto }: HandleTelegramWebhookCommand): Promise<void> {
    console.log('webhook dto:', JSON.stringify(dto));

    const text = dto.message?.text;
    const chatId = dto.message?.from.id;

    if (!text || !chatId) return;

    const [command, code] = text.split(' ');

    if (command !== '/start' || !code) return;

    const userInstance =
      await this.usersExternalRepo.findByTelegramConfirmationCode(code);

    if (!userInstance) return;

    userInstance.telegramChatId = String(chatId);
    userInstance.telegramConfirmationCode = null;

    await this.usersExternalRepo.save(userInstance);
  }
}
