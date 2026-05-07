import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'http';
import request from 'supertest';
import { Model } from 'mongoose';

import { UsersTestManager } from 'test/helpers/users-test-manager.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import {
  UserAccount,
  UserAccountDocument,
} from 'src/modules/user-accounts/domain/entities/user.entity';
import { BadRequestError } from '../utils/bad-request-error.util';

describe('Auth swagger contract', () => {
  let app: INestApplication;
  let userTestManager: UsersTestManager;
  let httpServer: Server;
  let authPath: string;

  let UserModel: Model<UserAccountDocument>;

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
    httpServer = app.getHttpServer() as Server;
    authPath = `/${GLOBAL_PREFIX}/auth` as string;

    UserModel = result.databaseConnection.model<UserAccountDocument>( // получаем модель (схему)
      UserAccount.name,
    );
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  describe('Tests for POST /api/auth/registration end-point', () => {
    it('status 204 - Input data is accepted. Email with confirmation code will be send to passed email address', async () => {
      const dto = userTestManager.getUserInputDto();

      await request(httpServer)
        .post(`${authPath}/registration`)
        .send(dto)
        .expect(HttpStatus.NO_CONTENT);

      // * Минимальная проверка, что пользователь реально создан в БД
      const createdUser = await UserModel.findOne({ email: dto.email });

      expect(createdUser).toBeTruthy();
      expect(createdUser!.emailConfirmation.isConfirmed).toBe(false);
      expect(createdUser!.emailConfirmation.confirmationCode).toBeTruthy();
      expect(
        createdUser!.emailConfirmation.emailConfirmationCodeExpiry,
      ).toBeTruthy();
    });

    it('status 400 - duplicate login)', async () => {
      const dtoFirst = userTestManager.getUserInputDto();
      const dtoSecond = {
        ...userTestManager.getUserInputDto(),
        login: dtoFirst.login,
      };

      await userTestManager.registrationUser(dtoFirst);

      const failedUserResult = (await userTestManager.registrationUser(
        dtoSecond,
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      // * Swagger: errorsMessages: [{ message, field }]
      expect(failedUserResult.errorsMessages).toHaveProperty('errorsMessages');

      const fields = failedUserResult.errorsMessages.map((e) => e.field);

      expect(fields).toContain('login');
    });

    it('status 400 - duplicate email', async () => {
      const dtoFirst = userTestManager.getUserInputDto();
      const dtoSecond = {
        ...userTestManager.getUserInputDto(),
        email: dtoFirst.email,
      };

      await userTestManager.registrationUser(dtoFirst);

      const failedUserResult = (await userTestManager.registrationUser(
        dtoSecond,
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      // * Swagger: errorsMessages: [{ message, field }]
      expect(failedUserResult.errorsMessages).toHaveProperty('errorsMessages');

      const fields = failedUserResult.errorsMessages.map((e) => e.field);

      expect(fields).toContain('email');
    });
  });
});
