import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'http';
import request from 'supertest';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';

import { UserTestManager } from 'test/helpers/users-test-manager.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import {
  UserAccount,
  UserAccountDocument,
} from 'src/modules/user-accounts/domain/entities/user.entity';
import { BadRequestError } from '../utils/bad-request-error.util';

const testRegistrationDto = {
  login: 'testUser',
  password: 'password123',
  email: 'test@example.com',
};

// const testLoginDto = {
//   loginOrEmail: 'TekMr6PvRu',
//   password: 'qwerty123',
// };

describe('Auth swagger contract', () => {
  let app: INestApplication;
  let httpServer: Server;
  let authPath: string;

  let userTestManager: UserTestManager;

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

      await userTestManager.registrationUser(dto);

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
        payload: { ...testRegistrationDto, login: '' },
        field: 'login',
      },
      {
        name: 'login must be string',
        payload: { ...testRegistrationDto, login: 2 },
        field: 'login',
      },
      {
        name: 'login length > 10 symbols',
        payload: { ...testRegistrationDto, login: 'a'.repeat(11) },
        field: 'login',
      },
      {
        name: 'login length < 3 symbols',
        payload: { ...testRegistrationDto, login: 'ab' },
        field: 'login',
      },

      // * password validation
      {
        name: 'password is empty',
        payload: { ...testRegistrationDto, password: '' },
        field: 'password',
      },
      {
        name: 'password must be string',
        payload: { ...testRegistrationDto, password: 2 },
        field: 'password',
      },
      {
        name: 'password length > 20 symbols',
        payload: { ...testRegistrationDto, password: 'a'.repeat(21) },
        field: 'password',
      },
      {
        name: 'password length < 6 symbols',
        payload: { ...testRegistrationDto, password: 'a'.repeat(5) },
        field: 'password',
      },

      // * email validation
      {
        name: 'email is empty',
        payload: { ...testRegistrationDto, email: '' },
        field: 'email',
      },
      {
        name: 'email must be string',
        payload: { ...testRegistrationDto, email: 2 },
        field: 'email',
      },
      {
        name: 'email is invalid (random string)',
        payload: { ...testRegistrationDto, email: 'not-a-url' },
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

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
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
      await userTestManager.getResendRegistrationEmail({
        email: userBefore!.email,
      });

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
        { email: 'invalid-email' },
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
      const userDto = await userTestManager.getRegisteredAndConfirmedUser();

      const result = (await userTestManager.getResendRegistrationEmail(
        { email: userDto.email },
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

    it('status 400 - if email is missing', async () => {
      const result = (await userTestManager.getResendRegistrationEmail(
        { email: '' },
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

    it('status 400 - if email is not found', async () => {
      const result = (await userTestManager.getResendRegistrationEmail(
        { email: 'not-found@example.dev' },
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

    it('status 204 - if new code confirms email successfully', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      await userTestManager.getResendRegistrationEmail({ email: dto.email });

      // * получаем новый код
      const userAfter = await UserModel.findOne({ email: dto.email });
      const newCode = userAfter!.emailConfirmation.confirmationCode;

      // * новый код должен заработать
      await userTestManager.getConfirmRegistration({ code: newCode! });

      // * isConfirmed = true
      const userConfirmed = await UserModel.findOne({ email: dto.email });

      expect(userConfirmed!.emailConfirmation.isConfirmed).toBe(true);
    });

    it('status 400 - if old code is invalid after resend', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      const userBefore = await UserModel.findOne({ email: dto.email });
      const oldCode = userBefore!.emailConfirmation.confirmationCode;

      await userTestManager.getResendRegistrationEmail({ email: dto.email });

      // * старый код не должен работать
      await userTestManager.getConfirmRegistration(
        { code: oldCode! },
        HttpStatus.BAD_REQUEST,
      );
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST /api/auth/registration-confirmation end-point', () => {
    it('status 204 - Email was verified. Account was activated', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      const userBefore = await UserModel.findOne({ email: dto.email });

      expect(userBefore).toBeTruthy();
      expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

      await userTestManager.getConfirmRegistration({
        code: userBefore!.emailConfirmation.confirmationCode!,
      });

      const userAfter = await UserModel.findOne({ email: dto.email });

      expect(userAfter).toBeTruthy();
      expect(userAfter!.emailConfirmation.isConfirmed).toBe(true);
    });

    it('status 400 - if incorrect code', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      const result = (await userTestManager.getConfirmRegistration(
        { code: 'WRONG_CODE' },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field: 'code',
          }),
        ]),
      );
    });

    it('status 400 - if already applied', async () => {
      // * confirm once
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      // * confirm second time -> should be 400
      const result = (await userTestManager.getConfirmRegistration(
        { code: user.confirmCode },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field: 'code',
          }),
        ]),
      );
    });

    it('status 400 - if expired code', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      const userBefore = await UserModel.findOne({ email: dto.email });

      // * make code expired
      await UserModel.updateOne(
        {
          email: dto.email,
        },
        {
          'emailConfirmation.emailConfirmationCodeExpiry': new Date(0), // 1970 год - гарантировано прострочен
        },
      );

      const result = (await userTestManager.getConfirmRegistration(
        { code: userBefore!.emailConfirmation.confirmationCode! },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field: 'code',
          }),
        ]),
      );
    });

    it('status 204 - if after confirmation user can login', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      // * до подтверждения → 401
      await userTestManager.login(
        { loginOrEmail: dto.login, password: dto.password },
        HttpStatus.UNAUTHORIZED,
      );

      const user = await UserModel.findOne({ email: dto.email });

      await userTestManager.getConfirmRegistration({
        code: user!.emailConfirmation.confirmationCode!,
      });

      // * после подтверждения → 200
      await userTestManager.login({
        loginOrEmail: dto.login,
        password: dto.password,
      });
    });

    it.each([
      {
        name: 'code is empty string',
        payload: { code: '' },
        field: 'code',
      },
      {
        name: 'code is missing',
        payload: {},
        field: 'code',
      },
      {
        name: 'code must be string',
        payload: { code: 123 },
        field: 'code',
      },
    ] as const)(
      'status 400 - validation field errors',
      async ({ payload, field }) => {
        const result = await request(httpServer)
          .post(`${authPath}/registration-confirmation`)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST);

        const body = result.body as BadRequestError;

        expect(body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST /api/auth/password-recovery end-point', () => {
    it('status 204 - sends recovery email for existing user', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      await userTestManager.getRecoveryPassword({ email: dto.email });

      // * проверяем что recoveryCode появился в БД
      const dbUser = await UserModel.findOne({
        email: dto.email,
      });

      expect(dbUser!.passwordRecovery.recoveryCode).toBeDefined();
      expect(dbUser!.passwordRecovery.recoveryCodeExpiry).toBeDefined();
      expect(
        new Date(dbUser!.passwordRecovery.recoveryCodeExpiry!) > new Date(),
      ).toBe(true);
    });

    it('status 204 - even if current email is not registered (for prevent user email detection)', async () => {
      await userTestManager.getRecoveryPassword({
        email: 'notexists@example.com',
      });
    });

    it.each([
      { name: 'invalid format', email: '222^gmail.com' },
      { name: 'missing @', email: 'invalid-email.com' },
      { name: 'empty string', email: '' },
      { name: 'missing domain', email: 'test@' },
    ])('status 400 - fields validation errors', async ({ email }) => {
      const result = (await userTestManager.getRecoveryPassword(
        { email: email },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      );
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST /api/auth/new-password end-point', () => {
    it('status 204 - if code is valid and new password is accepted', async () => {
      const NEW_PASSWORD = 'NewPass123!';

      const user = await userTestManager.getRegisteredAndConfirmedUser();

      // * send recovery password
      await userTestManager.getRecoveryPassword({ email: user.email });

      // * get recovery code from DB
      const dbUser = await UserModel.findOne({
        email: user.email,
      });

      expect(dbUser).toBeTruthy();
      expect(dbUser!.passwordRecovery.recoveryCode).toBeTruthy();

      // * set new password
      await userTestManager.getNewPassword({
        newPassword: NEW_PASSWORD,
        recoveryCode: dbUser!.passwordRecovery.recoveryCode!,
      });

      // * login user by new password -> 200
      await userTestManager.login({
        loginOrEmail: user.login,
        password: NEW_PASSWORD,
      });

      // * login with old password -> 400
      await userTestManager.login(
        {
          loginOrEmail: user.login,
          password: user.password,
        },
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 400 - if recoveryCode is incorrect', async () => {
      const NEW_PASSWORD = 'NewPass123!';
      const INCORRECT_RECOVERY_CODE = 'incorrect-recovery-code';

      const result = (await userTestManager.getNewPassword(
        {
          newPassword: NEW_PASSWORD,
          recoveryCode: INCORRECT_RECOVERY_CODE,
        },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expect(result.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'recoveryCode',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('status 400 - if recoveryCode already used', async () => {
      const NEW_PASSWORD = 'NewPass123!';
      const ANOTHER_PASSWORD = 'AnotherPass';
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      await userTestManager.getRecoveryPassword({ email: dto.email });

      const dbUser = await UserModel.findOne({
        email: dto.email,
      });

      // * первый раз — 204
      await userTestManager.getNewPassword({
        newPassword: NEW_PASSWORD,
        recoveryCode: dbUser!.passwordRecovery.recoveryCode!,
      });

      // * второй раз с тем же кодом → 400
      await userTestManager.getNewPassword(
        {
          newPassword: ANOTHER_PASSWORD,
          recoveryCode: dbUser!.passwordRecovery.recoveryCode!,
        },
        HttpStatus.BAD_REQUEST,
      );
    });

    it.each([
      {
        name: 'newPassword is missing',
        payload: { recoveryCode: 'some-code' }, // newPassword is missing
        field: 'newPassword',
      },
      {
        name: 'newPassword must be string',
        payload: { recoveryCode: 'some-code', newPassword: 123 },
        field: 'newPassword',
      },
      {
        name: 'newPassword length > 20 symbols',
        payload: { recoveryCode: 'some-code', newPassword: 'a'.repeat(21) },
        field: 'newPassword',
      },
      {
        name: 'newPassword length < 6 symbols',
        payload: { recoveryCode: 'some-code', newPassword: 'a'.repeat(5) },
        field: 'newPassword',
      },
    ] as const)(
      'status 400 - fields validation errors ($name)',
      async ({ payload, field }) => {
        const response = await request(httpServer)
          .post(`${authPath}/new-password`)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST);

        const body = response.body as BadRequestError;

        expect(body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST /api/auth/login end-point', () => {
    it('status 200 - returns JWT accessToken (expired after 5 minutes) in body', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      const result = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });

    it('status 401 - if email not confirmed', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      // * пытаемся залогиниться без подтверждения email
      await userTestManager.login(
        {
          loginOrEmail: dto.login,
          password: dto.password,
        },
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 401 - if user does not exist', async () => {
      await userTestManager.login(
        {
          loginOrEmail: 'nonexistent@test.com',
          password: 'password123',
        },
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 401 - with wrong password', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      await userTestManager.login(
        {
          loginOrEmail: user.login,
          password: 'wrong_password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    });

    // it.each([
    //   // * loginOrEmail validation
    //   //   {
    //   //     name: 'loginOrEmail length > 500 symbols',
    //   //     payload: { ...testLoginDto, loginOrEmail: 'a'.repeat(501) },
    //   //     field: 'loginOrEmail',
    //   //   },
    //   //   {
    //   //     name: 'loginOrEmail length < 3 symbols',
    //   //     payload: { ...testLoginDto, loginOrEmail: 'ab' },
    //   //     field: 'loginOrEmail',
    //   //   },
    //   // * password validation
    //   //   {
    //   //     name: 'password length > 20 symbols',
    //   //     payload: { ...testLoginDto, password: 'a'.repeat(21) },
    //   //     field: 'password',
    //   //   },
    //   //   {
    //   //     name: 'password length < 6 symbols',
    //   //     payload: { ...testLoginDto, password: 'abcde' },
    //   //     field: 'password',
    //   //   },
    // ] as const)(
    //   'status 400 - fields validation errors)',
    //   async ({ payload, field }) => {
    //     const response = await request(httpServer)
    //       .post(`${authPath}/login`)
    //       .send(payload)
    //       .expect(HttpStatus.BAD_REQUEST);

    //     const body = response.body as BadRequestError;

    //     expect(body.errorsMessages).toEqual(
    //       expect.arrayContaining([
    //         expect.objectContaining({
    //           message: expect.any(String),
    //           field,
    //         }),
    //       ]),
    //     );
    //   },
    // );

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST /api/auth/me end-point', () => {
    it('status 200 - with valid access token', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      const loginResult = await userTestManager.login({
        loginOrEmail: user.email,
        password: user.password,
      });

      const meResult = await userTestManager.getMe(loginResult.accessToken);

      expect(meResult).toHaveProperty('email', user.email);
      expect(meResult).toHaveProperty('login', user.login);
      expect(meResult).toHaveProperty('userId', expect.any(String));
    });

    it('status 401 - without token (Unauthorized)', async () => {
      await userTestManager.getMe(undefined, HttpStatus.UNAUTHORIZED);
    });

    it('status 401 - with invalid token', async () => {
      await userTestManager.getMe('invalidToken', HttpStatus.UNAUTHORIZED);
    });

    it('status 401 - with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'someId' },
        process.env.AT_SECRET!,
        { expiresIn: '-1s' },
      );

      await userTestManager.getMe(expiredToken, HttpStatus.UNAUTHORIZED);
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });
});
