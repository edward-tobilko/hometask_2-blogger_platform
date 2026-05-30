import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { RefreshTokenAuthGuard } from '../../guards/bearer/refresh-token-auth.guard';
import { CurrentUserFromRequest } from '../../guards/decorators/params/current-user.param-decorator';
import { SecurityDevicesQuery } from '../../application/queries/get-security-devices.query';

@Controller(API_ROUTES.securityDevices)
export class SecurityDevicesController {
  constructor(private readonly queryBus: QueryBus) {}

  // * Returns all devices with active sessions for current user
  @Get()
  @UseGuards(RefreshTokenAuthGuard)
  getSecurityDevices(@CurrentUserFromRequest() currentUser: { id: string }) {
    return this.queryBus.execute(new SecurityDevicesQuery(currentUser.id));
  }
}
