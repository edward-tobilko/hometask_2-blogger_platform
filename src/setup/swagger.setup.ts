import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication, isSwaggerEnable: boolean) {
  if (isSwaggerEnable) {
    const config = new DocumentBuilder()
      // * Header
      .setTitle('BLOGGER API - h15')
      .setDescription(
        'Continue to migrate the application to nestjs.\n\n' +
          'Should complete:\n\n' +
          '✔ CRUD blogs, posts, comments, likes.\n\n' +
          '✔ login must set a refreshToken in the cookie (you can use a stub). ' +
          'It is not necessary to implement the token pair update (/api/auth/refresh-token).',
      )

      // * Authorization
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token only',
      }) // for JWT access token auth
      .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basicAuth') // for basic auth
      .addCookieAuth('refreshToken', {
        type: 'apiKey',
        description:
          'JWT refreshToken inside cookie. Must be correct, and must not expire',
        name: 'refreshToken',
        in: 'cookie',
      }) // for jwt refresh token auth

      // * Version
      .setVersion('1.0')

      // * End-points
      .addTag('App')
      .addTag('Auth')
      .addTag('Blogs')
      .addTag('Comments')
      .addTag('Posts')
      .addTag('SecurityDevices')
      .addTag('Testing')
      .addTag('Users')

      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
}
