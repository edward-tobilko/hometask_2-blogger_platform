import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { PostViewModel } from '../../dto/view-dto/post.view-dto';
import {
  FieldErrorViewModel,
  ValidationErrorViewModel,
} from 'src/core/dto/validation-errors-view.dto';
import { CreatePostDto } from '../../dto/input-dto/create-post.input-dto';

export const ApiCreatePostSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(
      PostViewModel,
      ValidationErrorViewModel,
      FieldErrorViewModel,
    ),
    ApiOperation({ summary }),
    ApiBasicAuth('basicAuth'),
    ApiConsumes('application/json', 'text/json', 'application/*+json'),
    ApiBody({
      type: CreatePostDto,
      description: 'Data for constructing new post entity',
    }),
    ApiResponse({
      status: 201,
      content: {
        'application/json': { schema: { $ref: getSchemaPath(PostViewModel) } },
        'text/plain': { schema: { $ref: getSchemaPath(PostViewModel) } },
        'text/json': { schema: { $ref: getSchemaPath(PostViewModel) } },
      },
      description: 'Returns the newly created post',
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
  );
