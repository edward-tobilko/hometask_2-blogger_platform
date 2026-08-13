import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserRegisteredEvent } from 'src/modules/user-accounts/domain/events/user-registered.event';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-sql.repository';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase implements ICommandHandler<
  ResendConfirmationEmailCommand,
  void
> {
  constructor(
    private usersRepo: UsersSqlRepository,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email does not exist',
        extensions: [
          new Extension('User with this email does not exist', 'email'),
        ],
      });

    if (user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [new Extension('Email is already confirmed', 'email')],
      });

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // set new deadline

    user.confirmationCode = randomUUID();
    user.emailConfirmationCodeExpiry = expirationDate;

    await this.usersRepo.save(user);

    this.eventBus.publish(
      new UserRegisteredEvent(user.email, user.confirmationCode),
    );
  }
}
