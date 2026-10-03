import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CoreConfig } from 'src/core/core.config';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { initSettings } from 'test/helpers/init-settings.helper';

const SECRET_HEADER = 'X-Telegram-Bot-Api-Secret-Token';

describe('Telegram webhook guard', () => {
  let app: INestApplication;
  let httpServer: Server;
  let webhookSecret: string;

  const webhookPath = `/${GLOBAL_PREFIX}/${API_ROUTES.integrations}/webhook`;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;

    // * Берём секрет из того же конфига, что и гард — а не из process.env
    webhookSecret = app.get(CoreConfig).telegramWebhookSecret;
  });

  afterAll(async () => await app.close());

  describe('Tests for POST: /api/integrations/telegram/webhook -> Telegram webhook secret verification', () => {
    it('status 401 - without secret header', async () => {
      await request(httpServer)
        .post(webhookPath)
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('status 401 - with wrong secret', async () => {
      await request(httpServer)
        .post(webhookPath)
        .set(SECRET_HEADER, 'wrong-secret')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('status 204 - with correct secret', async () => {
      await request(httpServer)
        .post(webhookPath)
        .set(SECRET_HEADER, webhookSecret)
        .send({}) // пустое тело: use-case выходит на if (!text || !chatId) return — в БД ничего не пишется;
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
