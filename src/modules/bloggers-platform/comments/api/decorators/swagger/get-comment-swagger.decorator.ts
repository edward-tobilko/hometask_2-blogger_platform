import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { CommentViewModel } from '../../dto/view-dto/comment.view-dto';

export const ApiGetCommentByIdSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(CommentViewModel) },
        },
        'text/plain': { schema: { $ref: getSchemaPath(CommentViewModel) } },
        'text/json': { schema: { $ref: getSchemaPath(CommentViewModel) } },
      },
    }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
