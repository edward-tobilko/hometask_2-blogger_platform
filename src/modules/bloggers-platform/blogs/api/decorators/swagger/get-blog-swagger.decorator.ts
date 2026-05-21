import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { BlogViewModel } from '../../dto/view-dto/blog.view-dto';

export const ApiGetBlogByIdSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': { schema: { $ref: getSchemaPath(BlogViewModel) } },
        'text/plain': { schema: { $ref: getSchemaPath(BlogViewModel) } },
        'text/json': { schema: { $ref: getSchemaPath(BlogViewModel) } },
      },
    }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
