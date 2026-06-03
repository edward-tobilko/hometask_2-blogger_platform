import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiRefreshTokenSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiCookieAuth('cookie'),

    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            title: 'LoginSuccessViewModel',
            properties: {
              accessToken: { type: 'string', description: 'JWT access token' },
            },
          },
        },
        'text/plain': {
          schema: {
            type: 'object',
            title: 'LoginSuccessViewModel',
            properties: {
              accessToken: { type: 'string', description: 'JWT access token' },
            },
          },
        },
        'text/json': {
          schema: {
            type: 'object',
            title: 'LoginSuccessViewModel',
            properties: {
              accessToken: { type: 'string', description: 'JWT access token' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
};
