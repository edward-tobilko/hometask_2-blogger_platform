import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';
import { CreatePostDto } from '../../dto/input-dto/create-post.input-dto';

export const ApiUpdatePostSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiBasicAuth('basicAuth'),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      type: CreatePostDto,
      description: 'Data for updating',
    }),

    ApiResponse({
      status: 204,
      description: 'No Content',
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
    ApiResponse({ status: 404, description: 'Not found' }),
  );
