import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CoreConfig } from 'src/core/core.config';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';

describe('Telegram auth link', () => {
  let app: INestApplication;
  let httpServer: Server;

  let userTestManager: UserTestManager;
  let botName: string;

  const authLinkPath = `/${GLOBAL_PREFIX}/${API_ROUTES.integrations}/auth`;

  // * Достаём код из ссылки вида https://t.me/<bot>?start=<code>
  const extractCode = (link: string): string =>
    new URL(link).searchParams.get('start')!;

  // * Регистрирует + логинит юзера, возвращает email (для проверки в БД) и accessToken
  const createLoggedInUser = async () => {
    const user = await userTestManager.getRegisteredAndConfirmedUser();

    const { accessToken } = await userTestManager.login({
      loginOrEmail: user.login,
      password: user.password,
    });

    return { email: user.email, accessToken };
  };

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
    userTestManager = result.userTestManager;

    botName = app.get(CoreConfig).telegramBotName;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  describe('Tests for POST: /api/integrations/telegram/auth -> Returns link to telegram bot', () => {
    it('status 201 - returns link to bot with confirmation code', async () => {
      const { accessToken } = await createLoggedInUser();

      const response = await request(httpServer)
        .post(authLinkPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.CREATED);

      const { link } = response.body as { link: string };

      expect(link).toMatch(
        new RegExp(`^https://t\\.me/${botName}\\?start=[0-9a-f-]{36}$`),
      );
    });

    it('status 201 - saves confirmation code from link to user in DB', async () => {
      const { email, accessToken } = await createLoggedInUser();

      const response = await request(httpServer)
        .post(authLinkPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.CREATED);

      const code = extractCode((response.body as { link: string }).link);

      const userInDb = await userTestManager.findUserByEmail(email);

      expect(userInDb!.telegramConfirmationCode).toBe(code);
    });

    it('status 201 - each call issues a new code and replaces the old one', async () => {
      const { email, accessToken } = await createLoggedInUser();

      const first = await request(httpServer)
        .post(authLinkPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.CREATED);

      const second = await request(httpServer)
        .post(authLinkPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.CREATED);

      const firstCode = extractCode((first.body as { link: string }).link);
      const secondCode = extractCode((second.body as { link: string }).link);

      const userInDb = await userTestManager.findUserByEmail(email);

      expect(secondCode).not.toBe(firstCode);
      expect(userInDb!.telegramConfirmationCode).toBe(secondCode); // старый код больше не действует
    });

    it('status 401 - without access token', async () => {
      await request(httpServer)
        .post(authLinkPath)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('status 401 - with invalid access token', async () => {
      await request(httpServer)
        .post(authLinkPath)
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
