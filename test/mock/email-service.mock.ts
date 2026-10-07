import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';

export class EmailServiceMock extends NodeMailerService {
  //* override method (названия методов в сервисах должны совпадать с названиями в моках)
  sendEmail(to: string, subject: string): Promise<boolean> {
    console.log(`EmailServiceMock.sendEmail -> to: ${to}, subject: ${subject}`); // тесты не зависят от SMTP

    return Promise.resolve(true);
  }
}
