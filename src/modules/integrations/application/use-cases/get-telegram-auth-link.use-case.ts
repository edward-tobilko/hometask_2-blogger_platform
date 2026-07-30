import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { CoreConfig } from 'src/core/core.config';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersExternalRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-external.repository';

export class GetTelegramAuthLinkCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetTelegramAuthLinkCommand)
export class GetTelegramAuthLinkUseCase implements ICommandHandler<
  GetTelegramAuthLinkCommand,
  string
> {
  constructor(
    private usersExternalRepo: UsersExternalRepository,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute({ userId }: GetTelegramAuthLinkCommand): Promise<string> {
    const user = await this.usersExternalRepo.findById(userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User with id:${userId} was not found!`,
      });
    }

    const code = randomUUID();

    user.setTelegramConfirmationCode(code);

    await this.usersExternalRepo.save(user);

    const botName = this.coreConfig.telegramBotName;
    const botLink = `https://t.me/${botName}?start=${code}`;

    return botLink;
  }
}
