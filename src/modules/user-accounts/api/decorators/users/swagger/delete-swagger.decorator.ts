import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ApiDeleteUserSwagger = (summary: string) =>
  applyDecorators(
    ApiParam({ name: 'id', description: 'User id', type: String }),

    ApiOperation({ summary }),

    ApiResponse({
      status: 204,
      description: 'No content',
    }),
    ApiResponse({
      status: 404,
      description: 'If specified user is not exists',
    }),
  );
