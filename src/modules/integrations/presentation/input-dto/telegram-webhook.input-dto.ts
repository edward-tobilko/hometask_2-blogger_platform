import { IsOptional } from 'class-validator';

export class TelegramWebhookDto {
  @IsOptional() // этот декоратор нужен, чтобы поле "выжило" в whitelist в pipesSetup ф-и
  message?: {
    from: {
      id: number;
    };

    text: string;
  };
}

// ? TelegramWebhookDto - DTO для входящих сообщений от Telegram. Telegram шлёт большой JSON — нам нужны только message.from.id (chatId пользователя) и message.text (текст, там будет /start <code>).
