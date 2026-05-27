import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';

export class EmailServiceMock extends NodeMailerService {
  //* override method (названия методов в сервисах должны совпадать с названиями в моках)
  sendRegistrationConfirmationEmail(
    email: string,
    code: string,
    template: (code: string) => string,
  ): Promise<boolean> {
    console.log(
      template(
        `Call mock method sendRegistrationConfirmationEmail / EmailServiceMock: ${email} and ${code}`,
      ),
    ); // Нужно чтобы тесты не зависели от SMTP.

    return Promise.resolve(true);
  }
}
