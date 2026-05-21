import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CreateCommentInputDto } from '../../dto/input-dto/create-comment.input-dto';
import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';

export const ApiCreateCommentFroPostSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      type: CreateCommentInputDto,
      description: 'Data for constructing new post entity',
    }),

    ApiResponse({
      status: 201,
      description: 'Returns the newly created post',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(CommentViewModel) },
        },
        'text/plain': { schema: { $ref: getSchemaPath(CommentViewModel) } },
        'text/json': { schema: { $ref: getSchemaPath(CommentViewModel) } },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ValidationErrorViewModel) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(ValidationErrorViewModel) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(ValidationErrorViewModel) },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 404,
      description: "If post with specified postId doesn't exists",
    }),
  );
