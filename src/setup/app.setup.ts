import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication, isSwaggerEnable: boolean) {
  app.use(cookieParser());

  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnable);
}
