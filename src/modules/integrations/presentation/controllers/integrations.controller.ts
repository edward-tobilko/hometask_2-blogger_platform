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

    return { link }; // возвращаем { link } с ссылкой на бота
  }

  @Post('webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleWebhook(@Body() dto: TelegramWebhookDto): Promise<void> {
    await this.commandBus.execute(new HandleTelegramWebhookCommand(dto)); // webhook открытый (Telegram не умеет авторизовываться), возвращает 204.
  }
}
