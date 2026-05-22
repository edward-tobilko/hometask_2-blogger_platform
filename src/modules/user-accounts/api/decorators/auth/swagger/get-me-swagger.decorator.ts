import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { UserSessionViewDto } from '../../../view-dto/user-session.view-dto';

export const ApiGetMeSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiExtraModels(UserSessionViewDto),

    ApiBearerAuth(),

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(UserSessionViewDto) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(UserSessionViewDto) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(UserSessionViewDto) },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
