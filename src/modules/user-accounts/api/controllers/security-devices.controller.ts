import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { RefreshTokenAuthGuard } from '../../guards/bearer/refresh-token-auth.guard';
import { CurrentUserFromRequest } from '../../guards/decorators/params/current-user.param-decorator';
import { SecurityDevicesQuery } from '../../application/queries/get-security-devices.query';
import { DeleteSecurityDeviceByIdCommand } from '../../application/use-cases/security-devices/delete-security-device-by-id.use-case';
import { DeleteAllSecurityDevicesExceptCurrentCommand } from '../../application/use-cases/security-devices/delete-all-security-devices.use-case';
import { ApiGetSecurityDevicesSwagger } from '../decorators/security-devices/swagger/get-security-devices-swagger.decorator';
import { ApiDeleteAllSecurityDevicesSwagger } from '../decorators/security-devices/swagger/delete-all-decurity-devices-swagger.decorator';
import { ApiDeleteSecurityDeviceByIdSwagger } from '../decorators/security-devices/delete-security-device-swagger.decorator';

@ApiTags('SecurityDevices')
@Controller(API_ROUTES.securityDevices)
export class SecurityDevicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @ApiGetSecurityDevicesSwagger(
    'Returns all devices with active sessions for current user',
  )
  @Get()
  @UseGuards(RefreshTokenAuthGuard)
  getSecurityDevices(@CurrentUserFromRequest() currentUser: { id: string }) {
    return this.queryBus.execute(new SecurityDevicesQuery(currentUser.id));
  }

  @ApiDeleteAllSecurityDevicesSwagger(
    "Terminate all other (exclude current) device's sessions",
  )
  @Delete()
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAllSecurityDevicesExceptCurrent(
    @CurrentUserFromRequest() currentUser: { id: string; deviceId: string },
  ) {
    return this.commandBus.execute(
      new DeleteAllSecurityDevicesExceptCurrentCommand(
        currentUser.id,
        currentUser.deviceId,
      ),
    );
  }

  @ApiDeleteSecurityDeviceByIdSwagger('Terminate specified device session')
  @Delete(':deviceId')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSecurityDevice(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @CurrentUserFromRequest() currentUser: { id: string },
  ) {
    const command = new DeleteSecurityDeviceByIdCommand(
      deviceId,
      currentUser.id,
    );

    return this.commandBus.execute(command);
  }
}

// ? ParseUUIDPipe - валидирует UUID с коробки
