import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { PostsPaginatedViewModel } from '../../dto/view-dto/posts-paginated.view-dto';

export const ApiGetPostsSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiResponse({
      status: 200,
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(PostsPaginatedViewModel) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(PostsPaginatedViewModel) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(PostsPaginatedViewModel) },
        },
      },
      description: 'Success',
    }),
  );
