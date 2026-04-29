import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API')
    .addBearerAuth() // for JWT tokens
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basicAuth') // for basic auth
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Blogger Swagger',
  });
}
