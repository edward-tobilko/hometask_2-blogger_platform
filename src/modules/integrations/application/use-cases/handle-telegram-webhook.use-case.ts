import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TelegramWebhookDto } from '../../presentation/input-dto/telegram-webhook.input-dto';
import { UsersExternalRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-external.repository';

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
    const text = dto.message?.text;
    const chatId = dto.message?.from.id;

    if (!text || !chatId) return;

    console.log('text before split');

    const [command, code] = text.split(' ');

    if (command !== '/start' || !code) return;

    console.log('text after split');

    const user =
      await this.usersExternalRepo.findByTelegramConfirmationCode(code);

    if (!user) return;

    user.confirmTelegramIntegration(String(chatId));

    await this.usersExternalRepo.save(user);
  }
}
