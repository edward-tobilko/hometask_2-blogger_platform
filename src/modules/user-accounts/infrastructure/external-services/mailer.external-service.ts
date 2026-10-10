import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import { CoreConfig } from 'src/core/core.config';

@Injectable()
export class NodeMailerService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

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

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // * Проверка для тестов (что бы письмо отправлялось фейково)
    if (this.coreConfig.isTesting) return true;

    const info = await this.transporter.sendMail({
      from: `"eddie" <${this.userConfig.email}>`,
      to,
      subject,
      html,
    });

    return info.accepted.length > 0;
  }
}
