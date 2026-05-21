import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';

export const ApiGetCommentsForPostSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(CommentsPaginatedViewModel), // если какой либо класс за пределами модуля

    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(CommentsPaginatedViewModel) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(CommentsPaginatedViewModel) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(CommentsPaginatedViewModel) },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "If post for passed postId doesn't exist",
    }),
  );
