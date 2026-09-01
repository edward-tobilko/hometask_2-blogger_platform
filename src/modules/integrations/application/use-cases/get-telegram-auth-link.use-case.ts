import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { CoreConfig } from 'src/core/core.config';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersSqlExternalRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql-external.repository';

export class GetTelegramAuthLinkCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetTelegramAuthLinkCommand)
export class GetTelegramAuthLinkUseCase implements ICommandHandler<
  GetTelegramAuthLinkCommand,
  string
> {
  constructor(
    private usersExternalRepo: UsersSqlExternalRepository,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute({ userId }: GetTelegramAuthLinkCommand): Promise<string> {
    const userInstance = await this.usersExternalRepo.findById(userId);

    if (!userInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User with id:${userId} was not found!`,
      });
    }

    const code = randomUUID();

    userInstance.telegramConfirmationCode = code;

    await this.usersExternalRepo.save(userInstance);

    const botName = this.coreConfig.telegramBotName;
    const botLink = `https://t.me/${botName}?start=${code}`;

    return botLink;
  }
}
