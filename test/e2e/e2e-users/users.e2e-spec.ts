import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { Server } from 'http';

import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { BadRequestError } from '../utils/bad-request-error.util';

describe('Users swagger contract', () => {
  let app: INestApplication;
  let httpServer: Server;
  let usersPath: string;

  let userTestManager: UserTestManager;

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
    usersPath = `/${GLOBAL_PREFIX}/users` as string;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  describe('Tests for GET /api/users end-point', () => {
    it('status 200 - should return users list (12 users with pagination)', async () => {
      // * create 12 users
      await userTestManager.createSeveralUsers(12);

      // * на 1й сторанице -> pageSize=10 (totalCount=12, pagesCount=2)
      const page1 = await userTestManager.getUsersPaginatedList({
        query: { pageNumber: 1, pageSize: 10 },
      });

      expect(page1.totalCount).toBe(12);
      expect(page1.pagesCount).toBe(2);
      expect(page1.items).toHaveLength(10);

      // * проверяем структуру первого элемента
      expect(page1.items[0]).toEqual({
        id: expect.any(String),
        login: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String),
      });

      // * на 2й сторанице -> pageSize=2 (totalCount=12, pagesCount=2)
      const page2 = await userTestManager.getUsersPaginatedList({
        query: { pageNumber: 2, pageSize: 10 },
      });

      expect(page2.totalCount).toBe(12);
      expect(page2.pagesCount).toBe(2);
      expect(page2.items).toHaveLength(2);
    });

    it('searching by login', async () => {
      await userTestManager.createUser({
        login: 'john',
        password: 'pass123',
        email: 'john@test.com',
      });

      await userTestManager.createUser({
        login: 'jane',
        password: 'pass123',
        email: 'jane@test.com',
      });

      const response = await userTestManager.getUsersPaginatedList({
        query: { searchLoginTerm: 'john' },
      });

      expect(response.totalCount).toBe(1);

      // * проверяем что нашли john
      expect(response.items[0].login).toBe('john');

      // * проверяем что jane не попала
      expect(
        response.items.find((item) => item.login === 'jane'),
      ).toBeUndefined();
    });

    it('searching by email', async () => {
      await userTestManager.createUser({
        login: 'john',
        password: 'pass123',
        email: 'john@test.com',
      });

      await userTestManager.createUser({
        login: 'jane',
        password: 'pass123',
        email: 'jane@test.com',
      });

      const response = await userTestManager.getUsersPaginatedList({
        query: { searchEmailTerm: 'john@test.com' },
      });

      expect(response.totalCount).toBe(1);

      // * проверяем что нашли john
      expect(response.items[0].email).toBe('john@test.com');

      // * проверяем что jane не попала
      expect(
        response.items.find((item) => item.email === 'jane@test.com'),
      ).toBeUndefined();
    });

    it('status 401 - if no Basic auth', async () => {
      await request(httpServer).get(usersPath).expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for POST /api/users end-point', () => {
    it('status 201 - returns created user and this user appears in list', async () => {
      const dto = userTestManager.getUserInputDto();

      const response = await userTestManager.createUser(dto);

      expect(response).toEqual({
        id: expect.any(String),
        login: dto.login,
        email: dto.email,
        createdAt: expect.any(String),
      });
    });

    it.each([
      // * login
      {
        name: 'login must be string',
        payload: { login: 123 },
        field: 'login',
      },
      {
        name: 'login is empty',
        payload: { login: '' },
        field: 'login',
      },
      {
        name: 'login too short',
        payload: { login: 'ab' },
        field: 'login',
      },
      {
        name: 'login too long',
        payload: { login: 'a'.repeat(11) },
        field: 'login',
      },

      // * password
      {
        name: 'password must be string',
        payload: { password: 123 },
        field: 'password',
      },
      {
        name: 'password is empty',
        payload: { password: '' },
        field: 'password',
      },
      {
        name: 'password too short',
        payload: { password: 'a'.repeat(5) },
        field: 'password',
      },
      {
        name: 'password too long',
        payload: { password: 'a'.repeat(21) },
        field: 'password',
      },

      // * email
      {
        name: 'email must be string',
        payload: { email: 123 },
        field: 'email',
      },
      {
        name: 'email is empty',
        payload: { email: '' },
        field: 'email',
      },
      {
        name: 'email invalid format',
        payload: { email: 'invalid-email' },
        field: 'email',
      },
    ] as const)(
      'status 400 - validation errors',
      async ({ payload, field }) => {
        const dto = userTestManager.getUserInputDto(payload);

        const user = (await userTestManager.createUser(
          dto,
          HttpStatus.BAD_REQUEST,
        )) as unknown as BadRequestError;

        expect(user.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it('status 400 - if user already exists (login/email not unique)', async () => {
      const dto = userTestManager.getUserInputDto();

      await userTestManager.createUser(dto);

      const duplicateResult = (await userTestManager.createUser(
        dto,
        HttpStatus.BAD_REQUEST,
      )) as unknown as BadRequestError;

      expect(duplicateResult.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/login|email/i),
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('status 401 - if no Authorization', async () => {
      const dto = userTestManager.getUserInputDto();

      await request(httpServer)
        .post(usersPath)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for DELETE /api/users/{id} end-point', () => {
    it('status 204 - should delete user', async () => {
      const dto = userTestManager.getUserInputDto();

      const user = await userTestManager.createUser(dto);

      await userTestManager.deleteUser(user.id);

      // * verify that the user no longer exists
      const response = await userTestManager.getUsersPaginatedList();

      expect(response.items).toEqual(
        expect.not.arrayContaining([expect.objectContaining({ id: user.id })]),
      );
    });

    it('status 401 - without authorization', async () => {
      const dto = userTestManager.getUserInputDto();

      const user = await userTestManager.createUser(dto);

      await request(httpServer)
        .delete(`${usersPath}/${user.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
