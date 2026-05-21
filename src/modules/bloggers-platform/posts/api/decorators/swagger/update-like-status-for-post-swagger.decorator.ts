import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { LikeStatusDto } from 'src/core/dto/like-status.dto';
import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';

export const ApiUpdateLikeStatusForPostSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(LikeStatusDto), // если какой либо класс за пределами модуля

    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      type: LikeStatusDto,
      description: 'Like model for make like/dislike/reset operation',
    }),

    ApiResponse({
      status: 204,
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
