import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TelegramWebhookDto } from '../../presentation/input-dto/telegram-webhook.input-dto';
import { UsersExternalRepository } from 'src/modules/user-accounts/infrastructure/external-repo/users.external-repo';

export class HandleTelegramWebhookCommand {
  constructor(public readonly dto: TelegramWebhookDto) {}
}

@CommandHandler(HandleTelegramWebhookCommand)
export class HandleTelegramWebhookUseCase implements ICommandHandler<
  HandleTelegramWebhookCommand,
  void
> {
  constructor(private usersExternalRepo: UsersExternalRepository) {}

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
