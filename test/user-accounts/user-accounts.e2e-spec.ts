import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { UsersTestManager } from 'test/helpers/users-test-manager.helper';
import { getUserInputDto } from './utils/get-user-input-dto.util';
import { initSettings } from 'test/helpers/init-settings.helper';

describe('user-accounts', () => {
  let app: INestApplication;
  let userTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: process.env.AT_SECRET,
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );

    app = result.app;
    userTestManager = result.userTestManager;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  it('POST /users -> status 201 - returns created user and this user appears in list', async () => {
    const dto = getUserInputDto();

    const response = await userTestManager.createUser(dto);

    expect(response).toEqual({
      id: expect.any(String),
      login: dto.login,
      email: dto.email,
      createdAt: expect.any(String),
    });
  });
});
