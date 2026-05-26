import { INestApplication } from '@nestjs/common';

import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication, isSwaggerEnable: boolean) {
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnable);
}
