import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';

export class EmailServiceMock extends NodeMailerService {
  //* override method
  sendConfirmationEmail(email: string, code: string): void {
    console.log(
      `Call mock method sendConfirmationEmail / EmailServiceMock: ${email} and ${code}`,
    ); // Нужно чтобы тесты не зависели от SMTP.

    return;
  }
}
