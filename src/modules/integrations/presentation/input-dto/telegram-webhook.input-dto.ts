export class TelegramWebhookDto {
  message?: {
    from: {
      id: number;
    };

    text: string;
  };
}

// ? TelegramWebhookDto - DTO для входящих сообщений от Telegram. Telegram шлёт большой JSON — нам нужны только message.from.id (chatId пользователя) и message.text (текст, там будет /start <code>).
