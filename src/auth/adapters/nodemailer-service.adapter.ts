import nodemailer from "nodemailer";
import { log } from "console";

import { appConfig } from "@core/settings/config";

let transporter = nodemailer.createTransport({
  // host: appConfig.SMTP_HOST,
  // port: Number(appConfig.SMTP_PORT), // 587
  // secure: appConfig.SMTP_SECURE === "true",
  service: "gmail",
  auth: {
    user: appConfig.EMAIL, // нашь email
    pass: appConfig.EMAIL_PASS, // получаем сгенерированный код в настройках гугл аккаунта (https://myaccount.google.com/security )
  },

  // requireTLS: true,
  // tls: {
  //   servername: appConfig.SMTP_HOST,
  // },

  // connectionTimeout: 10_000, // установка TCP
  // greetingTimeout: 10_000, // ожидание SMTP
  // socketTimeout: 10_000, // общий таймаут сокета
});

export const nodeMailerService = {
  async sendRegistrationConfirmationEmail(
    email: string, // куда отправляем
    code: string, // код подтверджения
    template: (code: string) => string // ф-я которая принимает код и отправляет html строку
  ): Promise<boolean> {
    log("SENDING EMAIL TO:", email);

    let info = await transporter.sendMail({
      from: `"eddie" <${appConfig.EMAIL}>`,
      to: email,
      subject: "Your code is here",
      html: template(code), // html body
    });

    log("SENT:", info);

    // return info.accepted.length > 0; // так будет надежней, если вдруг будет не валидный email
    return !!info;
  },
};

// ? "!!info" - превращает значения в true or false
