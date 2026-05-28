import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { NodeMailerService } from '../../infrastructure/external-services/mailer.external-service';
import { emailTemplates } from '../../infrastructure/external-services/email-templates.external-service';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private mailerService: NodeMailerService) {}

  async handle(event: UserRegisteredEvent) {
    try {
      await this.mailerService.sendRegistrationConfirmationEmail(
        event.email,
        event.confirmationCode,
        (code: string) => emailTemplates.registrationEmail(code),
      );
    } catch (error: unknown) {
      console.error('EMAIL_SEND_ERROR', error);
      // возможно: поставить в очередь на повторную отправку (но это уже тема очередей задач: Bull/BullMQ (Redis-based) для nest)
    }
  }
}
