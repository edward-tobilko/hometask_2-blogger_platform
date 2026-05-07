import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';

import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';

export class UsersTestManager {
  constructor(private readonly app: INestApplication) {}

  httpServer = this.app.getHttpServer() as Server;

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.httpServer)
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as UserViewDto;
  }
}
