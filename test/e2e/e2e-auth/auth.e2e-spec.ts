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

const testDto = {
  login: 'testUser',
  password: 'password123',
  email: 'test@example.com',
};

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

    it('status 400 - if duplicate login)', async () => {
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
      expect(failedUserResult).toHaveProperty('errorsMessages');

      const fields = failedUserResult.errorsMessages.map((e) => e.field);

      expect(fields).toContain('login');
    });

    it('status 400 - if duplicate email', async () => {
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
      expect(failedUserResult).toHaveProperty('errorsMessages');

      const fields = failedUserResult.errorsMessages.map((e) => e.field);

      expect(fields).toContain('email');
    });

    it.each([
      // * login validation
      {
        name: 'login is empty',
        payload: { ...testDto, login: '' },
        field: 'login',
      },
      {
        name: 'login must be string',
        payload: { ...testDto, login: 2 },
        field: 'login',
      },
      {
        name: 'login length > 10 symbols',
        payload: { ...testDto, login: 'a'.repeat(11) },
        field: 'login',
      },
      {
        name: 'login length < 3 symbols',
        payload: { ...testDto, login: 'ab' },
        field: 'login',
      },

      // * password validation
      {
        name: 'password is empty',
        payload: { ...testDto, password: '' },
        field: 'password',
      },
      {
        name: 'password must be string',
        payload: { ...testDto, password: 2 },
        field: 'password',
      },
      {
        name: 'password length > 20 symbols',
        payload: { ...testDto, password: 'a'.repeat(21) },
        field: 'password',
      },
      {
        name: 'password length < 6 symbols',
        payload: { ...testDto, password: 'a'.repeat(5) },
        field: 'password',
      },

      // * email validation
      {
        name: 'email is empty',
        payload: { ...testDto, email: '' },
        field: 'email',
      },
      {
        name: 'email must be string',
        payload: { ...testDto, email: 2 },
        field: 'email',
      },
      {
        name: 'email is invalid (random string)',
        payload: { ...testDto, email: 'not-a-url' },
        field: 'email',
      },
    ] as const)(
      'status 400 - If the inputModel has incorrect values',
      async ({ payload, field }) => {
        const dto = userTestManager.getUserInputDto(payload);

        const createUserResponse = (await userTestManager.registrationUser(
          dto,
          HttpStatus.BAD_REQUEST,
        )) as BadRequestError;

        expect(createUserResponse.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );
  });

  describe('Tests for POST /api/auth/registration-email-resending end-point', () => {
    it('status 204 - Input data is accepted. Email with confirmation code will be send to passed email address.', async () => {
      const dto = userTestManager.getUserInputDto();

      // * register user (creates user with isConfirmed=false)
      await userTestManager.registrationUser(dto);

      const userBefore = await UserModel.findOne({ email: dto.email });

      expect(userBefore).toBeTruthy();
      expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

      // * getting old confirm code
      const oldCode = userBefore!.emailConfirmation.confirmationCode;

      // * resend confirmation email
      await userTestManager.getResendRegistrationEmail();

      // * confirmation code should be changed
      const userAfter = await UserModel.findOne({ email: dto.email });

      expect(userAfter).toBeTruthy();
      expect(userAfter!.emailConfirmation.isConfirmed).toBe(false);

      const newCode = userAfter!.emailConfirmation.confirmationCode;

      // * check the code was changed
      expect(newCode).not.toBe(oldCode);
    });

    it('status 400  - if email is invalid', async () => {
      const result = (await userTestManager.getResendRegistrationEmail(
        'invalid-email',
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field: 'email',
          }),
        ]),
      );
    });

    it('status 400 - if email already confirmed', async () => {
      const userDto = userTestManager.getUserInputDto();

      // * register
      await userTestManager.registrationUser(userDto);

      // * finding user by email
      const user = await UserModel.findOne({ email: userDto.email });

      // * getting confirm code
      const confirmCode = user!.emailConfirmation.confirmationCode;

      await userTestManager.confirmRegistration(confirmCode!);

      const result = (await userTestManager.getResendRegistrationEmail(
        userDto.email,
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field: 'email',
          }),
        ]),
      );
    });

    // it('POST: /auth/registration-email-resending -> status 400 (email is missing)', async () => {
    //   const result = await createAuthResendRegistrationEmail(app, {}).expect(
    //     HTTP_STATUS_CODES.BAD_REQUEST_400,
    //   );

    //   expect(result.body.errorsMessages).toEqual(
    //     expect.arrayContaining([
    //       expect.objectContaining({
    //         message: expect.any(String),
    //         field: 'email',
    //       }),
    //     ]),
    //   );
    // });

    // it('POST: /auth/registration-email-resending -> status 400 (email not found)', async () => {
    //   const result = await createAuthResendRegistrationEmail(app, {
    //     email: 'noone@example.dev',
    //   }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    //   expect(result.body.errorsMessages).toEqual(
    //     expect.arrayContaining([
    //       expect.objectContaining({
    //         message: expect.any(String),
    //         field: 'email',
    //       }),
    //     ]),
    //   );
    // });

    // it('POST: /auth/registration-email-resending -> new code confirms email successfully', async () => {
    //   const userDto = getUserDto();

    //   await createAuthRegisterUser(app, userDto).expect(
    //     HTTP_STATUS_CODES.NO_CONTENT_204,
    //   );

    //   await createAuthResendRegistrationEmail(app, {
    //     email: userDto.email,
    //   }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    //   // * получаем новый код
    //   const userAfter = await UserModel.findOne({ email: userDto.email });
    //   const newCode = userAfter!.emailConfirmation.confirmationCode;

    //   // * новый код должен заработать
    //   await createAuthConfirmRegistration(app, { code: newCode }).expect(
    //     HTTP_STATUS_CODES.NO_CONTENT_204,
    //   );

    //   // * isConfirmed = true
    //   const userConfirmed = await UserModel.findOne({ email: userDto.email });
    //   expect(userConfirmed!.emailConfirmation.isConfirmed).toBe(true);
    // });

    // it('POST: /auth/registration-email-resending -> old code is invalid after resend', async () => {
    //   const userDto = getUserDto();

    //   await createAuthRegisterUser(app, userDto).expect(
    //     HTTP_STATUS_CODES.NO_CONTENT_204,
    //   );

    //   const userBefore = await UserModel.findOne({ email: userDto.email });
    //   const oldCode = userBefore!.emailConfirmation.confirmationCode;

    //   await createAuthResendRegistrationEmail(app, {
    //     email: userDto.email,
    //   }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    //   // * старый код не должен работать
    //   await createAuthConfirmRegistration(app, { code: oldCode }).expect(
    //     HTTP_STATUS_CODES.BAD_REQUEST_400,
    //   );
    // });
  });
});
