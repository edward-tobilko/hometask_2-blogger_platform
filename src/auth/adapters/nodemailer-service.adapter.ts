import nodemailer from "nodemailer";
import { log } from "console";

import { appConfig } from "@core/settings/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: appConfig.EMAIL, // нашь email
    pass: appConfig.EMAIL_PASS, // получаем сгенерированный код в настройках гугл аккаунта (https://myaccount.google.com/security )
  },
});

export const nodeMailerService = {
  async sendRegistrationConfirmationEmail(
    email: string, // куда отправляем
    code: string, // код подтверджения
    template: (code: string) => string // ф-я которая принимает код и отправляет html строку
  ): Promise<boolean> {
    const info = await transporter.sendMail({
      from: `"eddie" <${appConfig.EMAIL}>`,
      to: email,
      subject: "Your code is here",
      html: template(code), // html body
    });

    log("info ->", info);

    return info.accepted.length > 0; // так будет надежней, если вдруг будет не валидный email
    // return !!info;
  },
};

// ? "!!info" - превращает значения в true or false
