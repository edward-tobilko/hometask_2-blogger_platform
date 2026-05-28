import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserPasswordRecoveryEvent } from '../../domain/events/user-password-recovery.event';
import { NodeMailerService } from '../../infrastructure/external-services/mailer.external-service';
import { emailTemplates } from '../../infrastructure/external-services/email-templates.external-service';

@EventsHandler(UserPasswordRecoveryEvent)
export class UserPasswordRecoveryEventHandler implements IEventHandler<UserPasswordRecoveryEvent> {
  constructor(private mailerService: NodeMailerService) {}

  async handle(event: UserPasswordRecoveryEvent) {
    // * по контракту нужно всегда возвращать 204, при ошибке не раскрывая деталей существования email
    try {
      await this.mailerService.sendRegistrationConfirmationEmail(
        event.email,
        event.recoveryCode,
        (code: string) => emailTemplates.passwordRecoveryEmail(code),
      );
    } catch (error) {
      console.error('EMAIL_SEND_ERROR', error);

      return; // тихо возвращаем void, клиент получает 204
    }
  }
}
