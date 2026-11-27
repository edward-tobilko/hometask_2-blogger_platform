import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { ConnectToPairCommand } from '../../application/use-cases/connect-to-pair.use-case';
import { CurrentUserFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';

@Controller(API_ROUTES.pairQuizGame)
export class PairGameController {
  constructor(private commandBus: CommandBus) {}

  // * Connect current user to existing random pending pair or create new pair which will be waiting second player.
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('/connection')
  connection(@CurrentUserFromRequest() currentUser: { id: string }) {
    const command = new ConnectToPairCommand(currentUser.id);

    return this.commandBus.execute(command);
  }
}
