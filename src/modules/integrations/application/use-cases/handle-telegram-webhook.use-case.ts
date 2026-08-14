import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TelegramWebhookDto } from '../../presentation/input-dto/telegram-webhook.input-dto';
import { UsersExternalRepository } from 'src/modules/user-accounts/infrastructure/mongo/repositories/users-external.repository';

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

    const user =
      await this.usersExternalRepo.findByTelegramConfirmationCode(code);

    if (!user) return;

    user.confirmTelegramIntegration(String(chatId));

    await this.usersExternalRepo.save(user);
  }
}
