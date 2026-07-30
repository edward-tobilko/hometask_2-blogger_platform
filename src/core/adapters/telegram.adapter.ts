import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { CoreConfig } from '../core.config';

@Injectable()
export class TelegramAdapter {
  private readonly baseUrl: string;

  constructor(
    private readonly coreConfig: CoreConfig,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = `https://api.telegram.org/bot${this.coreConfig.telegramBotToken}`; // строится один раз в конструкторе из токена
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    const url = `${this.baseUrl}/sendMessage`;

    await firstValueFrom(this.httpService.post(url, { chat_id: chatId, text }));
  }
}

// ? sendMessage - POST-запрос к Telegram Bot API, chat_id  - это уникальный ID чата пользователя

// ? firstValueFrom - конвертирует Observable (rxjs) в Promise
