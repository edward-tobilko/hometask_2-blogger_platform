import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-sql.repository';

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

    if (userAccount.isConfirmed === true)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [new Extension('Email is already confirmed', 'code')],
      });

    if (userAccount.confirmationCode !== code)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code is incorrect',
        extensions: [new Extension('Confirmation code is incorrect', 'code')],
      });

    if (
      !userAccount.emailConfirmationCodeExpiry ||
      userAccount.emailConfirmationCodeExpiry < new Date()
    )
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code is expired or already been applied',
        extensions: [
          new Extension(
            'Confirmation code is expired or already been applied',
            'code',
          ),
        ],
      });

    userAccount.emailConfirmationCodeExpiry = null;
    userAccount.isConfirmed = true;

    await this.usersRepo.save(userAccount);
  }
}
