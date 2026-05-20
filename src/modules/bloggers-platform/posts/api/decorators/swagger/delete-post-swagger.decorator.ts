import { applyDecorators } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiDeletePostSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiBasicAuth('basicAuth'),
    ApiResponse({ status: 204, description: 'No Content' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
