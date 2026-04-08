import { Controller, Get, Res } from '@nestjs/common';

import { AppService, RootPageResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  rootPage(): RootPageResponse {
    return this.appService.rootPage();
  }
}
