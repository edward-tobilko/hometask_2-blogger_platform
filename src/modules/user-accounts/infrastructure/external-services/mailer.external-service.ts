import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import { CoreConfig } from 'src/core/core.config';

@Injectable()
export class NodeMailerService {
  private transporter: Transporter;

  constructor(
    private coreConfig: CoreConfig,
    private userConfig: UserAccountsConfig,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.userConfig.email,
        pass: this.userConfig.emailPass,
      },
    });
  }

  async sendRegistrationConfirmationEmail(
    email: string, // куда отправляем
    code: string, // код подтверджения
    template: (code: string) => string, // ф-я которая принимает код и отправляет html строку)
  ): Promise<boolean> {
    // * Проверка для тестов (что бы письмо отправлялось фейково)
    if (this.coreConfig.isTesting) return true;

    console.log('SENDING EMAIL TO:', email);

    const info = await this.transporter.sendMail({
      from: `"eddie" <${this.userConfig.email}>`,
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
