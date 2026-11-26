import { Controller, Post } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';

@Controller(API_ROUTES.pairQuizGame)
export class PairGameController {
  constructor() {}

  @Post('/connection')
  // TODO: JwtAuthGuard, ConnectToPairUseCase, @HttpCode(200), return GamePairViewModel
  connection() {
    return '/connection end-point';
  }
}
