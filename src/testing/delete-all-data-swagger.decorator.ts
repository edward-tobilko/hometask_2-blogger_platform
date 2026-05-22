import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiDeleteAllDataSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiResponse({ status: 204, description: 'All data is deleted' }),
  );
