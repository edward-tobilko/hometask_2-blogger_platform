import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { PostViewModel } from '../../dto/view-dto/post.view-dto';

export const ApiGetPostByIdSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': { schema: { $ref: getSchemaPath(PostViewModel) } },
        'text/plain': { schema: { $ref: getSchemaPath(PostViewModel) } },
        'text/json': { schema: { $ref: getSchemaPath(PostViewModel) } },
      },
    }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
