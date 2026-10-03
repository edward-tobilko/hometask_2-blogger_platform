import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CurrentUserFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';
import { GetTelegramAuthLinkCommand } from '../../application/use-cases/get-telegram-auth-link.use-case';
import { TelegramWebhookDto } from '../input-dto/telegram-webhook.input-dto';
import { HandleTelegramWebhookCommand } from '../../application/use-cases/handle-telegram-webhook.use-case';
import { TelegramWebhookGuard } from '../guards/telegram-webhook.guard';

@Controller(API_ROUTES.integrations)
export class IntegrationsController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Post('auth')
  async getAuthLink(
    @CurrentUserFromRequest() user: { id: string },
  ): Promise<{ link: string }> {
    const command = new GetTelegramAuthLinkCommand(user.id);

    const link = await this.commandBus.execute(command);

    return { link }; // возвращаем ссылку на бота
  }

  @Post('webhook')
  @UseGuards(TelegramWebhookGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleWebhook(@Body() dto: TelegramWebhookDto): Promise<void> {
    console.log('webhook dto:', JSON.stringify(dto)); // http://127.0.0.1:4040/inspect/http -> POST: /api/integration/telegram/webhook -> Headers -> X-Telegram-Bot-Api-Secret-Token;

    const chatId = dto.message?.from?.id;
    const text = dto.message?.text;

    if (!text || !chatId) return; // не текстовое сообщение (стикер, фото и т.п.) — игнорируем!

    const command = new HandleTelegramWebhookCommand(String(chatId), text);

    await this.commandBus.execute(command);
  }
}
