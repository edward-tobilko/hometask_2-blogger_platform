import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { SecurityDevicesViewModel } from '../../../view-dto/security-devices.view-dto';

export const ApiGetSecurityDevicesSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiExtraModels(SecurityDevicesViewModel),

    ApiCookieAuth(),

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(SecurityDevicesViewModel) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(SecurityDevicesViewModel) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(SecurityDevicesViewModel) },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
