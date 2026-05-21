import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { UsersPaginatedViewDto } from 'src/modules/user-accounts/api/view-dto/users-paginated.view-dto';

export const ApiGetUsersSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiExtraModels(UsersPaginatedViewDto), // потому что UsersPaginatedViewDto расширяет PaginatedViewDto которого нету в users-account module.

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(UsersPaginatedViewDto) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(UsersPaginatedViewDto) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(UsersPaginatedViewDto) },
        },
      },
    }),
  );
};
