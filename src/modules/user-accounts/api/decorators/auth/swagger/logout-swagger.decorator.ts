import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiLogoutSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiCookieAuth('cookie'),

    ApiResponse({
      status: 204,
      description: 'No content',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
};
