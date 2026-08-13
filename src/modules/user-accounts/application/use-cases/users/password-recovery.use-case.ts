import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { UserPasswordRecoveryEvent } from 'src/modules/user-accounts/domain/events/user-password-recovery.event';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-sql.repository';

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
    private usersRepo: UsersSqlRepository,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user) return; // не раскрываем факт существования email

    // * set deadline for recovery code
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    user.recoveryCode = randomUUID();
    user.recoveryCodeExpiry = expirationDate;

    await this.usersRepo.save(user);

    this.eventBus.publish(
      new UserPasswordRecoveryEvent(user.email, user.recoveryCode),
    );
  }
}
