import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersExternalRepository } from 'src/modules/user-accounts/infrastructure/external-repo/users.external-repo';

export class HandleTelegramWebhookCommand {
  constructor(
    public readonly chatId: string,
    public readonly text: string,
  ) {}
}

@CommandHandler(HandleTelegramWebhookCommand)
export class HandleTelegramWebhookUseCase implements ICommandHandler<
  HandleTelegramWebhookCommand,
  void
> {
  constructor(private usersExternalRepo: UsersExternalRepository) {}

  async execute({ chatId, text }: HandleTelegramWebhookCommand): Promise<void> {
    const [command, code] = text.split(' ');

    if (command !== '/start' || !code) return;

    await this.usersExternalRepo.linkTelegramChat(code, chatId);
  }
}
