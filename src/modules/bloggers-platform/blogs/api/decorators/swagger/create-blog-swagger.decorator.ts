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
import { CreateBlogDto } from '../../dto/input-dto/create-blog.input-dto';
import { BlogViewModel } from '../../dto/view-dto/blog.view-dto';

export const ApiCreateBlogSwagger = (summary: string) =>
  applyDecorators(
    ApiExtraModels(ValidationErrorViewModel, FieldErrorViewModel), // если какой либо класс за пределами модуля

    ApiOperation({ summary }),

    ApiBasicAuth('basicAuth'),
    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      type: CreateBlogDto,
      description: 'Data for constructing new blog entity',
    }),

    ApiResponse({
      status: 201,
      content: {
        'application/json': { schema: { $ref: getSchemaPath(BlogViewModel) } },
        'text/plain': { schema: { $ref: getSchemaPath(BlogViewModel) } },
        'text/json': { schema: { $ref: getSchemaPath(BlogViewModel) } },
      },
      description: 'Returns the newly created blog',
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
