import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodeMailerService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL'), // нашь email в .env
        pass: this.configService.get('EMAIL_PASS'), // получаем сгенерированный код в настройках гугл аккаунта (https://myaccount.google.com/security )
      },
    });
  }

  async sendRegistrationConfirmationEmail(
    email: string, // куда отправляем
    code: string, // код подтверджения
    template: (code: string) => string, // ф-я которая принимает код и отправляет html строку)
  ): Promise<boolean> {
    // * Проверка для тестов (что бы письмо отправлялось фейково)
    if (process.env.NODE_ENV === 'test') return true;

    console.log('SENDING EMAIL TO:', email);

    // * если сторонний сервис плохо типизирован, и никакая типизация не помогает -> исп. ниже строку
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const info = await this.transporter.sendMail({
      from: `"eddie" <${this.configService.get('EMAIL')}>`,
      to: email,
      subject:
        'This email was sent using nodemailer. View your confirmation code here.',
      html: template(code), // html body
    });

    console.log('SENT:', info);

    return !!info;
  }
}

// ? "!!info" - превращает значения в true or false
