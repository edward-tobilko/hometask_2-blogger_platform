import { Controller, Get } from '@nestjs/common';

import { AppService, RootPageResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // * Return root page
  @Get()
  rootPage(): RootPageResponse {
    return this.appService.getRootPage();
  }
}
