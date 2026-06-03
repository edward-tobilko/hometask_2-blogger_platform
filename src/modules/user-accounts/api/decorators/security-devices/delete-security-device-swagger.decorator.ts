import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

export const ApiDeleteSecurityDeviceByIdSwagger = (summary: string) =>
  applyDecorators(
    ApiParam({
      name: 'deviceId',
      description: 'Id of session that will be terminated',
      type: String,
    }),

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
    ApiResponse({
      status: 403,
      description: 'If try to delete the deviceId of other user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
