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
import { expectErrorField } from '../utils/expect-error-field.util';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import {
  loginConstraints,
  passwordConstraints,
} from 'src/modules/user-accounts/constraints/users.constraints';

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
          secret: process.env.ACCESS_TOKEN_SECRET,
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

  describe('Tests for POST: /api/auth/password-recovery end-point -> Password recovery via email confirmation. Email should be sent with RecoveryCode inside', () => {
    it('status 204 - sends recovery email for existing user', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      await userTestManager.getRecoveryPassword({ email: dto.email });

      // * проверяем что recoveryCode появился в БД
      const dbUser = await userTestManager.findUserByEmail(dto.email);

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

      expectErrorField(result, 'email');
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST: /api/auth/new-password end-point -> Confirm password recovery', () => {
    it('status 204 - if code is valid and new password is accepted', async () => {
      const NEW_PASSWORD = 'NewPass123!';

      const user = await userTestManager.getRegisteredAndConfirmedUser();

      // * send recovery password
      await userTestManager.getRecoveryPassword({ email: user.email });

      // * get recovery code from DB
      const dbUser = await userTestManager.findUserByEmail(user.email);

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

      expectErrorField(result, 'recoveryCode');
    });

    it('status 400 - if recoveryCode already used', async () => {
      const NEW_PASSWORD = 'NewPass123!';
      const ANOTHER_PASSWORD = 'AnotherPass';
      const dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      await userTestManager.getRecoveryPassword({ email: dto.email });

      const dbUser = await userTestManager.findUserByEmail(dto.email);

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
        payload: {
          recoveryCode: 'some-code',
          newPassword: 'a'.repeat(passwordConstraints.maxLength + 1),
        },
        field: 'newPassword',
      },
      {
        name: 'newPassword length < 6 symbols',
        payload: {
          recoveryCode: 'some-code',
          newPassword: 'a'.repeat(passwordConstraints.minLength - 1),
        },
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

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST: /api/auth/login end-point -> Try login user to the system', () => {
    it('status 200 - returns JWT accessToken (expired after 5 minutes) in body', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      const result = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
      expect(
        result.cookies.some((cookie) => cookie.startsWith('refreshToken=')),
      ).toBe(true);
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
    //   {
    //     name: 'loginOrEmail length > 500 symbols',
    //     payload: { loginOrEmail: 'a'.repeat(501) },
    //     field: 'loginOrEmail',
    //   },
    //   {
    //     name: 'loginOrEmail length < 3 symbols',
    //     payload: { loginOrEmail: 'ab' },
    //     field: 'loginOrEmail',
    //   },
    //   // * password validation
    //   {
    //     name: 'password length > 20 symbols',
    //     payload: { password: 'a'.repeat(21) },
    //     field: 'password',
    //   },
    //   {
    //     name: 'password length < 6 symbols',
    //     payload: { password: 'abcde' },
    //     field: 'password',
    //   },
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

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Generate new pair of access and refresh tokens (in cookie client must send correct refresh token that will be revoked after refreshing). Device LastActiveDate should be overrode by issued Date of new refresh token. P.s. We need to create a new DeviceSession collection to store session refresh tokens, so that when a new token is generated, we revoke the old one—since the old token remains valid after rotation, there is no database check', () => {
    it('status 200 - Returns new JWT accessToken in body and JWT refreshToken in cookie', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();
      const loginResult = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      const oldRefreshCookie = loginResult.cookies.find((cookie) =>
        cookie.startsWith('refreshToken='),
      )!;

      const refreshResult =
        await userTestManager.getRefreshToken(oldRefreshCookie);

      expect(refreshResult).toHaveProperty('accessToken');
      expect(
        refreshResult.cookies.some((token) =>
          token.startsWith('refreshToken='),
        ),
      ).toBe(true);
    });

    it('status 401 - without refresh token cookie', async () => {
      await userTestManager.getRefreshToken('', HttpStatus.UNAUTHORIZED);
    });

    it('status 401 - with invalid refresh token', async () => {
      await userTestManager.getRefreshToken(
        'refreshToken=invalid-token',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 401 - old refresh token is revoked after refresh', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();
      const loginResult = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });
      const oldCookie = loginResult.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;

      // * обновляем токен
      await userTestManager.getRefreshToken(oldCookie);

      // * старый токен теперь невалиден (lastActiveDate не совпадает)
      await userTestManager.getRefreshToken(oldCookie, HttpStatus.UNAUTHORIZED);
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST: /api/auth/registration-confirmation end-point -> Confirm registration', () => {
    let userBefore: UserAccountDocument | null;
    let dto: CreateUserInputDto;

    beforeEach(async () => {
      dto = userTestManager.getUserInputDto();

      // * register user (creates user with isConfirmed=false)
      await userTestManager.registrationUser(dto);

      userBefore = await userTestManager.findUserByEmail(dto.email);
    });

    it('status 204 - Email was verified. Account was activated', async () => {
      expect(userBefore).toBeTruthy();
      expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

      await userTestManager.getConfirmRegistration({
        code: userBefore!.emailConfirmation.confirmationCode!,
      });

      const userAfter = await userTestManager.findUserByEmail(dto.email);

      expect(userAfter).toBeTruthy();
      expect(userAfter!.emailConfirmation.isConfirmed).toBe(true);
    });

    it('status 400 - if incorrect code', async () => {
      const result = (await userTestManager.getConfirmRegistration(
        { code: 'WRONG_CODE' },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expectErrorField(result, 'code');
    });

    it('status 400 - if already applied', async () => {
      // * confirm once
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      // * confirm second time -> should be 400
      const result = (await userTestManager.getConfirmRegistration(
        { code: user.confirmCode },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expectErrorField(result, 'code');
    });

    it('status 400 - if expired code', async () => {
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

      expectErrorField(result, 'code');
    });

    it('status 204 - if after confirmation user can login', async () => {
      // * до подтверждения → 401
      await userTestManager.login(
        { loginOrEmail: dto.login, password: dto.password },
        HttpStatus.UNAUTHORIZED,
      );

      const user = await userTestManager.findUserByEmail(dto.email);

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

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST: /api/auth/registration end-point -> Registration in the system. Email with confirmation code will be send to passed email address', () => {
    let result: UserAccountDocument | null;
    let dto: CreateUserInputDto;

    beforeEach(async () => {
      dto = userTestManager.getUserInputDto();

      await userTestManager.registrationUser(dto);

      // * Минимальная проверка, что пользователь реально создан в БД
      result = await userTestManager.findUserByEmail(dto.email);
    });

    it('status 204 - Input data is accepted. Email with confirmation code will be send to passed email address', () => {
      expect(result).toBeTruthy();
      expect(result!.emailConfirmation.isConfirmed).toBe(false);
      expect(result!.emailConfirmation.confirmationCode).toBeTruthy();
      expect(
        result!.emailConfirmation.emailConfirmationCodeExpiry,
      ).toBeTruthy();
    });

    it('status 400 - if duplicate login)', async () => {
      const dtoSecond = userTestManager.getUserInputDto({ login: dto.login });

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
      const dtoSecond = userTestManager.getUserInputDto({ email: dto.email });

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
        payload: { login: '' },
        field: 'login',
      },
      {
        name: 'login must be string',
        payload: { login: 2 },
        field: 'login',
      },
      {
        name: 'login length > 10 symbols',
        payload: { login: 'a'.repeat(loginConstraints.maxLength + 1) },
        field: 'login',
      },
      {
        name: 'login length < 3 symbols',
        payload: { login: 'a'.repeat(loginConstraints.minLength - 1) },
        field: 'login',
      },

      // * password validation
      {
        name: 'password is empty',
        payload: { password: '' },
        field: 'password',
      },
      {
        name: 'password must be string',
        payload: { password: 2 },
        field: 'password',
      },
      {
        name: 'password length > 20 symbols',
        payload: { password: 'a'.repeat(passwordConstraints.maxLength + 1) },
        field: 'password',
      },
      {
        name: 'password length < 6 symbols',
        payload: { password: 'a'.repeat(passwordConstraints.minLength - 1) },
        field: 'password',
      },

      // * email validation
      {
        name: 'email is empty',
        payload: { email: '' },
        field: 'email',
      },
      {
        name: 'email must be string',
        payload: { email: 2 },
        field: 'email',
      },
      {
        name: 'email is invalid (random string)',
        payload: { email: 'not-a-url' },
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

        expectErrorField(createUserResponse, field);
      },
    );

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for POST: /api/auth/registration-email-resending end-point -> Resend confirmation registration  email if user exist', () => {
    let userBefore: UserAccountDocument | null;
    let dto: CreateUserInputDto;

    beforeEach(async () => {
      dto = userTestManager.getUserInputDto();

      // * register user (creates user with isConfirmed=false)
      await userTestManager.registrationUser(dto);

      userBefore = await userTestManager.findUserByEmail(dto.email);
    });

    it('status 204 - Input data is accepted. Email with confirmation code will be send to passed email address.', async () => {
      expect(userBefore).toBeTruthy();
      expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

      // * getting old confirm code
      const oldCode = userBefore!.emailConfirmation.confirmationCode;

      // * resend confirmation email
      await userTestManager.getResendRegistrationEmail({
        email: userBefore!.email,
      });

      // * confirmation code should be changed
      const userAfter = await userTestManager.findUserByEmail(dto.email);

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

      expectErrorField(result, 'email');
    });

    it('status 400 - if email already confirmed', async () => {
      const userDto = await userTestManager.getRegisteredAndConfirmedUser();

      const result = (await userTestManager.getResendRegistrationEmail(
        { email: userDto.email },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expectErrorField(result, 'email');
    });

    it('status 400 - if email is missing', async () => {
      const result = (await userTestManager.getResendRegistrationEmail(
        { email: '' },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expectErrorField(result, 'email');
    });

    it('status 400 - if email is not found', async () => {
      const result = (await userTestManager.getResendRegistrationEmail(
        { email: 'not-found@example.dev' },
        HttpStatus.BAD_REQUEST,
      )) as BadRequestError;

      expectErrorField(result, 'email');
    });

    it('status 204 - if new code confirms email successfully', async () => {
      await userTestManager.getResendRegistrationEmail({ email: dto.email });

      // * получаем новый код
      const userAfter = await userTestManager.findUserByEmail(dto.email);
      const newCode = userAfter!.emailConfirmation.confirmationCode;

      // * новый код должен заработать
      await userTestManager.getConfirmRegistration({ code: newCode! });

      // * isConfirmed = true
      const userConfirmed = await userTestManager.findUserByEmail(dto.email);

      expect(userConfirmed!.emailConfirmation.isConfirmed).toBe(true);
    });

    it('status 400 - if old code is invalid after resend', async () => {
      const userBefore = await userTestManager.findUserByEmail(dto.email);
      const oldCode = userBefore!.emailConfirmation.confirmationCode;

      await userTestManager.getResendRegistrationEmail({ email: dto.email });

      // * старый код не должен работать
      await userTestManager.getConfirmRegistration(
        { code: oldCode! },
        HttpStatus.BAD_REQUEST,
      );
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });

  describe('Tests for GET: /api/auth/me end-point -> Get info about current user', () => {
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
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '-1s' },
      );

      await userTestManager.getMe(expiredToken, HttpStatus.UNAUTHORIZED);
    });

    it.skip('status 429 - more than 5 attempts from one IP during 10 seconds (IS_DISABLE_RATE_LIMIT=true in test env)', async () => {});
  });
});
