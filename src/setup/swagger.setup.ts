import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API - h15')
    .setDescription(
      'Continue to migrate the application to nestjs.\n\n' +
        'Should complete:\n\n' +
        '✔ CRUD blogs, posts, comments, likes.\n\n' +
        '✔ login must set a refreshToken in the cookie (you can use a stub). ' +
        'It is not necessary to implement the token pair update (/api/auth/refresh-token).',
    )
    .addBearerAuth() // for JWT tokens
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basicAuth') // for basic auth
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Blogger Swagger',
  });
}
