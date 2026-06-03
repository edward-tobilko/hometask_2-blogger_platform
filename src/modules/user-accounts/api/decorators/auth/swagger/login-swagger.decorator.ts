import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';

export const ApiLoginSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      schema: {
        type: 'object',
        properties: {
          loginOrEmail: { type: 'string' },
          password: { type: 'string' },
        },
      },
    }),

    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 5 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 24 hours)',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            title: 'LoginSuccessViewModel',
            properties: {
              accessToken: { type: 'string', description: 'JWT access token' },
            },
          },
        },
        'text/plain': {
          schema: {
            type: 'object',
            title: 'LoginSuccessViewModel',
            properties: {
              accessToken: { type: 'string', description: 'JWT access token' },
            },
          },
        },
        'text/json': {
          schema: {
            type: 'object',
            title: 'LoginSuccessViewModel',
            properties: {
              accessToken: { type: 'string', description: 'JWT access token' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: `If the inputModel has incorrect values`,
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
    ApiResponse({
      status: 401,
      description: 'If the password or login or email is wrong',
    }),
  );
};
