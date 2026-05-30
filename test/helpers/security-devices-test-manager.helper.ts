import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';

import { SecurityDevicesViewModel } from 'src/modules/user-accounts/api/view-dto/security-devices.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';

export class SecurityDevicesTestManager {
  constructor(private readonly app: INestApplication) {}

  httpServer = this.app.getHttpServer() as Server;
  securityDevicesPath = `/${GLOBAL_PREFIX}/security/devices` as string;

  async getSecurityDevices(
    refreshTokenCookie: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<SecurityDevicesViewModel[]> {
    const response = await request(this.httpServer)
      .get(`${this.securityDevicesPath}`)
      .set('Cookie', refreshTokenCookie)
      .expect(statusCode);

    return response.body as SecurityDevicesViewModel[];
  }
}
