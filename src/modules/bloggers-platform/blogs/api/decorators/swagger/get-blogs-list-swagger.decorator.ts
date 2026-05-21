import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { BlogListPaginatedViewModel } from '../../dto/view-dto/blogs-paginated.view-dto';

export const ApiGetBlogsSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(BlogListPaginatedViewModel),

    ApiOperation({ summary }),

    ApiResponse({
      status: 200,
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(BlogListPaginatedViewModel) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(BlogListPaginatedViewModel) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(BlogListPaginatedViewModel) },
        },
      },
      description: 'Success',
    }),
  );
