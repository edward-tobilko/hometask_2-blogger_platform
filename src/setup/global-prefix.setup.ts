import { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = 'api';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix(GLOBAL_PREFIX); // теперь все маршруты будут начинаться с /api/...
}
