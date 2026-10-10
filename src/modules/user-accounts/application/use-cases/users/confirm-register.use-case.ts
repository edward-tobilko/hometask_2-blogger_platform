import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';

export class ConfirmationRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmationRegistrationCommand)
export class ConfirmationRegistrationUseCase implements ICommandHandler<
  ConfirmationRegistrationCommand,
  void
> {
  constructor(private usersRepo: UsersSqlRepository) {}

  async execute({ code }: ConfirmationRegistrationCommand): Promise<void> {
    const userAccount = await this.usersRepo.findByConfirmationCode(code);

    if (!userAccount)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Incorrect code',
        extensions: [new Extension('Incorrect code', 'code')],
      });

    userAccount.confirmEmail();

    await this.usersRepo.save(userAccount);
  }
}
