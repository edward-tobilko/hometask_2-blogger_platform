import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';

export const ApiGetPostsForBlogSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(PostsPaginatedViewModel),

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
    ApiResponse({
      status: 404,
      description: 'If specificied blog is not exists',
    }),
  );
