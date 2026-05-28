import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserPasswordRecoveryEvent } from 'src/modules/user-accounts/domain/events/user-password-recovery.event';

import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryCommand,
  void
> {
  constructor(
    private eventBus: EventBus,
    private usersRepo: UsersRepository,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user) return; // не раскрываем факт существования email

    user.setPasswordRecoveryCode();

    await this.usersRepo.save(user);

    this.eventBus.publish(
      new UserPasswordRecoveryEvent(
        user.email,
        user.passwordRecovery.recoveryCode!,
      ),
    );
  }
}
