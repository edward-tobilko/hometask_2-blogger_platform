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

import {
  FieldErrorViewModel,
  ValidationErrorViewModel,
} from 'src/core/dto/validation-errors-view.dto';
import { CreatePostForBlogDto } from '../../dto/input-dto/create-post-for-blog.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';

export const CreatePostForBlogSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(ValidationErrorViewModel, FieldErrorViewModel), // если какой либо класс за пределами модуля

    ApiOperation({ summary }),

    ApiBasicAuth('basicAuth'),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),
    ApiBody({
      type: CreatePostForBlogDto,
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
    ApiResponse({
      status: 404,
      description: "If specified blog doesn't exists",
    }),
  );
