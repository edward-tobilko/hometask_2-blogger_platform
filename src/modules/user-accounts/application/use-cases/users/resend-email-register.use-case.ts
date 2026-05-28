import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import { UserRegisteredEvent } from 'src/modules/user-accounts/domain/events/user-registered.event';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase implements ICommandHandler<
  ResendConfirmationEmailCommand,
  void
> {
  constructor(
    private usersRepo: UsersRepository,
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

    user.resendConfirmationCode();

    await this.usersRepo.save(user);

    this.eventBus.publish(
      new UserRegisteredEvent(
        user.email,
        user.emailConfirmation.confirmationCode!,
      ),
    );
  }
}
