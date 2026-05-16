import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { emailTemplates } from 'src/modules/user-accounts/infrastructure/external-services/email-templates.external-service';
import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';
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
    private mailerService: NodeMailerService,
    private usersRepo: UsersRepository,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user) return; // не раскрываем факт существования email

    user.setPasswordRecoveryCode();

    // * по контракту нужно всегда возвращать 204, при ошибке не раскрывая деталей существования email
    try {
      await this.mailerService.sendRegistrationConfirmationEmail(
        user.email,
        user.passwordRecovery.recoveryCode!,
        (code: string) => emailTemplates.passwordRecoveryEmail(code),
      );

      await this.usersRepo.save(user);
    } catch (error) {
      console.error('EMAIL_SEND_ERROR', error);

      return; // тихо возвращаем void, клиент получает 204
    }
  }
}
