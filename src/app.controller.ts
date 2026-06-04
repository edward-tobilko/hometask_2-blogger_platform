import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { AppService, RootPageResponse } from './app.service';
import { ApiAppSwagger } from './app-swagger.decorator';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags('App')
  @ApiAppSwagger('Get API information')
  @Get('root-page')
  rootPage(): RootPageResponse {
    return this.appService.getRootPage();
  }
}
