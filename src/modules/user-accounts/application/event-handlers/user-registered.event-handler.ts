import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { NodeMailerService } from '../../infrastructure/external-services/mailer.external-service';
import { emailTemplates } from '../../infrastructure/external-services/templates/email.template';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private mailerService: NodeMailerService) {}

  async handle(event: UserRegisteredEvent) {
    const { subject, html } = emailTemplates.registrationEmail(
      event.confirmationCode,
    );

    try {
      await this.mailerService.sendEmail(event.email, subject, html);
    } catch (error: unknown) {
      console.error('EMAIL_SEND_ERROR', error);
    }
  }
}
