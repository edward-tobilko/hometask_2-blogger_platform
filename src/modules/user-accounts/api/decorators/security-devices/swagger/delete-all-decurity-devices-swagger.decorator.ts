import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiDeleteAllSecurityDevicesSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiCookieAuth(),

    ApiResponse({
      status: 204,
      description: 'No Content',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
